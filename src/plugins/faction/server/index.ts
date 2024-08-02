import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { Character } from '@Shared/types/character.js';
import { useWebview } from '@Server/player/webview.js';

const Rebar = useRebar();
const serverConfig = Rebar.useServerConfig();
const Keybinder = Rebar.systems.useKeybinder();
const db = Rebar.database.useDatabase();

db.createCollection('faction');

declare global {
    export interface ServerPlugin {
        ['faction-api']: ReturnType<typeof useApi>;
    }
}

declare module 'alt-shared' {
    export interface ICustomEntityStreamSyncedMeta {
        job?: JobState;
    }
}

declare module '@Shared/types/character.js' {
    export interface Character {
        job?: JobState;
    }
}

type PlayerParams = {
    player?: alt.Player;
    characterId?: number;
};

// 基本类型
export type Permission = 'manage_vehicles' | 'manage_funds' | 'manage_members' | 'assign_jobs' | 'dissolve_faction';

export interface Vehicle {
    id: string;
    model: string;
}

export interface Position {
    name: string;
    rank: number;
    permissions: Permission[];
    description?: string;
    salary?: number;
}

export interface State {
    name: string;
    description: string;
    pos: alt.Vector3;
    inter?: string;
}

// 工作相关接口
export interface Job extends Position {
    faction: string;
}

export interface JobState extends Job {
    beOnDuty?: boolean;
}

// 成员相关接口
export interface Member {
    id: string;
    name: string;
    job: Job;
    desc?: string;
}

// 派系相关接口
export interface Faction {
    name: string;
    description: string;
    type: '私企' | '国企' | '行政部门' | '公共事业' | '黑道';
    members: Member[];
    vehicles: Vehicle[];
    funds: number;
    jobs: Position[];
    states?: State[];
}

/*const SyncedBinder = Rebar.systems.useStreamSyncedBinder();
SyncedBinder.syncCharacterKey('job');*/

/**
 * 在玩家创建角色后给予背包的文档参数
 */
function giveCharacterDefaultData(player: alt.Player) {
    const doc = Rebar.document.character.useCharacter(player);
    if (!doc) {
        return;
    }
    const defaultJob: JobState = {
        name: '无业',
        faction: null,
        rank: null,
        permissions: null,
        beOnDuty: false
    };
    doc.set('job', defaultJob);
}

// 玩家创建角色时触发
const api = Rebar.useApi();
const charSelectApi = api.get('character-creator-api');
charSelectApi.onCreate(giveCharacterDefaultData);

async function notifyPlayer(player: alt.Player, title: string, subTitle: string, message: string) {
    const notify = await Rebar.useApi().getAsync('ascended-notification-api');
    notify.create(player, {
        icon: '🏬',
        title,
        subTitle,
        message
    });
}

async function updateJobForPlayer(player: alt.Player, job: JobState) {
    Rebar.document.character.useCharacter(player).set('job', job);
}

async function updateJobForDatabase(characterId: string, job: JobState) {
    await db.update({ _id: characterId, job }, 'characters');
}

function useApi() {
    async function createFaction(bossId: number, faction: Faction) {
        const factionExisting = await db.getMany<{ _id: string } & Faction>({ name: faction.name }, 'faction');
        if (factionExisting.length > 0) {
            return false;
        }

        const bossPlayerDoc = await db.getMany<{ _id: string } & Character>({ id: bossId }, 'characters');
        if (!bossPlayerDoc || bossPlayerDoc.length === 0) {
            return false;
        }

        const newFaction: Faction = {
            ...faction,
            members: [{
                id: bossPlayerDoc[0]._id,
                name: bossPlayerDoc[0].name,
                job: {
                    faction: faction.name,
                    rank: 0,
                    name: '创始人',
                    permissions: ['manage_vehicles', 'manage_funds', 'manage_members', 'assign_jobs', 'dissolve_faction'],
                }
            }]
        };

        await db.create(newFaction, 'faction');

        const bossPlayer = alt.Player.all.find((player) => player.getStreamSyncedMeta('id') === bossPlayerDoc[0].id);
        const job: JobState = {
            faction: faction.name,
            rank: 0,
            name: '创始人',
            permissions: ['manage_vehicles', 'manage_funds', 'manage_members', 'assign_jobs', 'dissolve_faction'],
            beOnDuty: false
        };

        if (bossPlayer) {
            await updateJobForPlayer(bossPlayer, job);
            await notifyPlayer(bossPlayer, '派系', '你已成为派系创始人', `你已成为${faction.name}的创始人，你可以在派系管理中管理派系成员，派系资金，派系车辆，派系职位等。`);
        } else {
            await updateJobForDatabase(bossPlayerDoc[0]._id, job);
        }

        return true;
    }

    async function addMember(memberId: number, factionName: string) {
        const factionExisting = await db.getMany<{ _id: string } & Faction>({ name: factionName }, 'faction');
        if (factionExisting.length === 0) {
            return false;
        }

        const faction = factionExisting[0];
        const memberDoc = await db.getMany<{ _id: string } & Character>({ id: memberId }, 'characters');
        if (!memberDoc) {
            return false;
        }

        const lowestRankJob = faction.jobs.reduce((lowest, job) => job.rank > lowest.rank ? job : lowest, faction.jobs[0]);

        const member = alt.Player.all.find((player) => player.getStreamSyncedMeta('id') === memberDoc[0].id);
        const job: JobState = {
            faction: faction.name,
            rank: lowestRankJob.rank,
            name: lowestRankJob.name,
            permissions: lowestRankJob.permissions,
            salary: lowestRankJob.salary,
            beOnDuty: false
        };

        if (member) {
            await updateJobForPlayer(member, job);
            await notifyPlayer(member, '派系', '你已加入派系', `你已成为${faction.name}的成员，职位为${lowestRankJob.name}。`);
        } else {
            memberDoc[0].job = job;
            await updateJobForDatabase(memberDoc[0]._id, job);
        }

        faction.members.push({
            id: memberDoc[0]._id,
            name: memberDoc[0].name,
            job: {
                faction: faction.name,
                rank: lowestRankJob.rank,
                name: lowestRankJob.name,
                permissions: lowestRankJob.permissions,
                salary: lowestRankJob.salary
            }
        });
        await db.update({ _id: factionExisting[0]._id, members: faction.members }, 'faction');

        return true;
    }

    async function removeMember(memberId: number, factionName: string) {
        const factionExisting = await db.getMany<{ _id: string } & Faction>({ name: factionName }, 'faction');
        if (factionExisting.length === 0) {
            return false;
        }

        const faction = factionExisting[0];
        const memberDoc = await db.getMany<{ _id: string } & Character>({ id: memberId }, 'characters');
        if (!memberDoc) {
            return false;
        }

        const memberIndex = faction.members.findIndex(member => member.id === memberDoc[0]._id);
        if (memberIndex === -1) {
            return false;
        }

        faction.members.splice(memberIndex, 1);

        const member = alt.Player.all.find((player) => player.getStreamSyncedMeta('id') === memberDoc[0].id);

        const defaultJob: JobState = {
            name: '无业',
            faction: null,
            rank: null,
            permissions: null,
            beOnDuty: false
        };

        if (member) {
            await updateJobForPlayer(member, defaultJob);
            await notifyPlayer(member, '派系', '你已被开除', `你已被${faction.name}派系开除。`);
        } else {
            memberDoc[0].job = defaultJob;
            await updateJobForDatabase(memberDoc[0]._id, defaultJob);
        }

        await db.update({ _id: factionExisting[0]._id, members: faction.members }, 'faction');
        return true;
    }

    async function promoteMember(handlerId: number, memberId: number, factionName: string) {
        const factionExisting = await db.getMany<{ _id: string } & Faction>({ name: factionName }, 'faction');
        if (factionExisting.length === 0) {
            return false;
        }

        const faction = factionExisting[0];
        const handlerDoc = await db.getMany<{ _id: string } & Character>({ id: handlerId }, 'characters');
        const memberDoc = await db.getMany<{ _id: string } & Character>({ id: memberId }, 'characters');
        if (!handlerDoc || !memberDoc) {
            return false;
        }

        const handlerJob = handlerDoc[0].job;
        const memberJob = memberDoc[0].job;

        if (!handlerJob.permissions.includes('manage_members') || handlerJob.rank + 1 >= memberJob.rank) {
            return false;
        }

        const higherRankJob = faction.jobs
            .filter(job => job.rank < memberJob.rank)
            .sort((a, b) => b.rank - a.rank)[0];

        if (!higherRankJob) {
            return false;
        }

        memberJob.rank = higherRankJob.rank;
        memberJob.name = higherRankJob.name;
        memberJob.permissions = higherRankJob.permissions;
        memberJob.salary = higherRankJob.salary;

        memberDoc[0].job = memberJob;
        await updateJobForDatabase(memberDoc[0]._id, memberJob);



        const memberIndex = faction.members.findIndex(m => m.id === memberDoc[0]._id);
        if (memberIndex !== -1) {
            faction.members[memberIndex].job = memberJob;
            await db.update({ _id: factionExisting[0]._id, members: faction.members }, 'faction');
        }

        const member = alt.Player.all.find((player) => player.getStreamSyncedMeta('id') === memberDoc[0].id);

        if (member) {
            await updateJobForPlayer(member, memberJob);
            await notifyPlayer(member, '派系', '你已升职', `你已被提升为${memberJob.name}。`);
        }

        return true;
    }

    async function demoteMember(handlerId: number, memberId: number, factionName: string) {
        const factionExisting = await db.getMany<{ _id: string } & Faction>({ name: factionName }, 'faction');
        if (factionExisting.length === 0) {
            return false;
        }

        const faction = factionExisting[0];
        const handlerDoc = await db.getMany<{ _id: string } & Character>({ id: handlerId }, 'characters');
        const memberDoc = await db.getMany<{ _id: string } & Character>({ id: memberId }, 'characters');
        if (!handlerDoc || !memberDoc) {
            return false;
        }

        const handlerJob = handlerDoc[0].job;
        const memberJob = memberDoc[0].job;

        if (!handlerJob.permissions.includes('manage_members') || handlerJob.rank + 1 >= memberJob.rank) {
            return false;
        }

        const lowerRankJob = faction.jobs
            .filter(job => job.rank > memberJob.rank)
            .sort((a, b) => a.rank - b.rank)[0];

        if (!lowerRankJob) {
            return false;
        }

        memberJob.rank = lowerRankJob.rank;
        memberJob.name = lowerRankJob.name;
        memberJob.permissions = lowerRankJob.permissions;
        memberJob.salary = lowerRankJob.salary;

        memberDoc[0].job = memberJob;
        await updateJobForDatabase(memberDoc[0]._id, memberJob);



        const memberIndex = faction.members.findIndex(m => m.id === memberDoc[0]._id);
        if (memberIndex !== -1) {
            faction.members[memberIndex].job = memberJob;
            await db.update({ _id: factionExisting[0]._id, members: faction.members }, 'faction');
        }


        const member = alt.Player.all.find((player) => player.getStreamSyncedMeta('id') === memberDoc[0].id);
        if (member) {
            await updateJobForPlayer(member, memberJob);
            await notifyPlayer(member, '派系', '你已降职', `你已被降职为${memberJob.name}。`);
        }


        return true;
    }

    async function dissolveFaction(handlerId: number, factionName: string) {
        const factionExisting = await db.getMany<{ _id: string } & Faction>({ name: factionName }, 'faction');
        if (factionExisting.length === 0) {
            return false;
        }

        const handlerDoc = await db.getMany<{ _id: string } & Character>({ id: handlerId }, 'characters');
        if (!handlerDoc) {
            return false;
        }

        const handlerJob = handlerDoc[0].job;
        if (!handlerJob.permissions.includes('dissolve_faction')) {
            return false;
        }

        await db.destroy(factionExisting[0]._id, 'faction');

        const members = factionExisting[0].members;
        for (let i = 0; i < members.length; i++) {
            const memberDoc = await db.getMany<{ _id: string } & Character>({ _id: members[i].id }, 'characters');
            if (!memberDoc) {
                continue;
            }

            const member = alt.Player.all.find((player) => player.getStreamSyncedMeta('id') === memberDoc[0].id);
            if (member) {
                await updateJobForPlayer(member, {
                    name: '无业',
                    faction: null,
                    rank: null,
                    permissions: null,
                    beOnDuty: false
                });
                await notifyPlayer(member, '派系', '派系解散', `派系${factionName}已解散。`);
            } else {
                memberDoc[0].job = {
                    name: '无业',
                    faction: null,
                    rank: null,
                    permissions: null,
                    beOnDuty: false
                };
                await updateJobForDatabase(memberDoc[0]._id, memberDoc[0].job);
            }
        }

        return true;
    }

    async function withdrawFunds(handlerId: number, factionName: string, amount: number) {
        const factionExisting = await db.getMany<{ _id: string } & Faction>({ name: factionName }, 'faction');
        if (factionExisting.length === 0) {
            return false;
        }

        const handlerDoc = await db.getMany<{ _id: string } & Character>({ id: handlerId }, 'characters');
        if (!handlerDoc) {
            return false;
        }

        const handlerJob = handlerDoc[0].job;
        if (!handlerJob.permissions.includes('manage_funds')) {
            return false;
        }

        const handleplayer = alt.Player.all.find((player) => player.getStreamSyncedMeta('id') === handlerId)


        const funds = factionExisting[0].funds;
        if (funds < amount) {
            if (handleplayer) {
                await  notifyPlayer(handleplayer, '派系', '操作失败', `派系账户没有足够的资金。`);
            }
            return false;
        }

        factionExisting[0].funds -= amount;
        await db.update({ _id: factionExisting[0]._id, funds: factionExisting[0].funds }, 'faction');

        handlerDoc[0].bank += amount;
        await db.update({ _id: handlerDoc[0]._id, bank: handlerDoc[0].bank }, 'characters');


        if (handleplayer) {
            await  notifyPlayer(handleplayer, '派系', '操作成功', `你已成功从${factionName}账户中取款${amount}，余额${factionExisting[0].funds}。`);
        }

        return true;
    }



    async function depositFunds(handlerId: number, factionName: string, amount: number) {
        const factionExisting = await db.getMany<{ _id: string } & Faction>({ name: factionName }, 'faction');
        if (factionExisting.length === 0) {
            return false;
        }

        const handlerDoc = await db.getMany<{ _id: string } & Character>({ id: handlerId }, 'characters');
        if (!handlerDoc) {
            return false;
        }

        const handlerJob = handlerDoc[0].job;
        if (!handlerJob.permissions.includes('manage_funds')) {
            return false;
        }

        const handleplayer = alt.Player.all.find((player) => player.getStreamSyncedMeta('id') === handlerId)

        handlerDoc[0].bank -= amount;
        await db.update({ _id: handlerDoc[0]._id, bank: handlerDoc[0].bank }, 'characters');

        factionExisting[0].funds += amount;
        await db.update({ _id: factionExisting[0]._id, funds: factionExisting[0].funds }, 'faction');

        if (handleplayer) {
            await notifyPlayer(handleplayer, '派系', '操作成功', `你已成功将${amount}存入${factionName}账户，余额${handlerDoc[0].bank}。`);
        }

        return true;
    }



    return {
        createFaction,
        addMember,
        removeMember,
        promoteMember,
        demoteMember,
        dissolveFaction,
        withdrawFunds,
        depositFunds,
    };
}

Rebar.useApi().register('faction-api', useApi());
