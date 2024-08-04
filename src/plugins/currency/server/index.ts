import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { CollectionNames } from '@Server/document/shared.js';
import { Account } from '@Shared/types/account.js';
import { Character } from '@Shared/types/character.js';

const API_NAME = 'currency-api';
const Rebar = useRebar();
const db = Rebar.database.useDatabase();
const api = Rebar.useApi();

declare global {
    export interface ServerPlugin {
        [API_NAME]: ReturnType<typeof useApi>;
    }
}

declare module '@Shared/types/account.js' {
    export interface Account {
        points?: number;
    }
}

/**
 * 在玩家创建角色后给予货币系统相关的文档参数
 */
function giveCharacterDefaultData(player: alt.Player) {
    const doc = Rebar.document.character.useCharacter(player);
    if (!doc) {
        return;
    }
    doc.set('cash', 0);
    doc.set('bank', 0);

    const acdoc = Rebar.document.account.useAccount(player);
    if (!acdoc) {
        return;
    }
    acdoc.set('points', 0);
}
// 玩家创建角色时触发
const charSelectApi = api.get('character-creator-api');
charSelectApi.onCreate(giveCharacterDefaultData);

type PlayerParams = {
    player?: alt.Player;
    characterId?: number;
};

async function sendNotification(player: alt.Player, type: string, amount: number, newAmount: number, operation: string) {
    const notify = await Rebar.useApi().getAsync('ascended-notification-api');
    let subTitle = '';
    let icon = '';
    if (type === 'cash') {
        subTitle = '现金';
        icon = '💵';
    } else if (type === 'bank') {
        subTitle = '银行存款';
        icon = '💳️';
    } else if (type === 'points') {
        subTitle = '信用点';
        icon = '🪙';
    }

    notify.create(player, {
        icon,
        title: '货币',
        subTitle,
        message: operation === 'add' ? `您的账户新增 ${amount} ${subTitle}，当前总计 ${newAmount} ${subTitle}。`
            : operation === 'sub' ? `您的账户扣除 ${amount} ${subTitle}，当前总计 ${newAmount} ${subTitle}。`
                : `您的账户被更新为 ${amount} ${subTitle}，当前总计 ${newAmount} ${subTitle}。`,
    });
}

function useApi() {
    async function updatePlayerData(playerData: any, field: string, amount: number) {
        playerData[0][field] = amount;
        await db.update({ _id: playerData[0]._id, [field]: playerData[0][field] }, CollectionNames.Characters);
    }

    async function handlePoints(accountData: any, amount: number, operation: string) {
        const currentPoints = accountData[0].points || 0;
        const newAmount = operation === 'add' ? currentPoints + amount : operation === 'sub' ? currentPoints - amount : amount;
        accountData[0].points = newAmount;
        await db.update({ _id: accountData[0]._id, points: accountData[0].points }, CollectionNames.Accounts);
        return newAmount;
    }

    async function handleCharacter(params: PlayerParams, type: string, amount: number, operation: string) {
        const { player, characterId } = params;

        if (!player) {
            const playerData = await db.getMany<{ _id: string } & Character>({ id: characterId }, CollectionNames.Characters);
            if (!playerData || playerData.length === 0) {
                return false;
            }

            if (type === 'cash' || type === 'bank') {
                const currentAmount = playerData[0][type] || 0;
                const newAmount = operation === 'add' ? currentAmount + amount : operation === 'sub' ? currentAmount - amount : amount;
                await updatePlayerData(playerData, type, newAmount);
                return true;
            }

            if (type === 'points') {
                const accountData = await db.getMany<{ _id: string } & Account>({ _id: playerData[0].account_id }, CollectionNames.Accounts);
                if (!accountData || accountData.length === 0) {
                    return false;
                }
                const newAmount = await handlePoints(accountData, amount, operation);
                return true;
            }
        } else {
            const character = Rebar.document.character.useCharacter(player);
            if (type === 'cash' || type === 'bank') {
                const currentAmount = character.getField(type) || 0;
                const newAmount = operation === 'add' ? currentAmount + amount : operation === 'sub' ? currentAmount - amount : amount;
                character.set(type, newAmount);

                await sendNotification(player, type, amount, newAmount, operation);
                return true;
            }

            if (type === 'points') {
                const account = Rebar.document.account.useAccount(player);
                const currentPoints = account.getField('points') || 0;
                const newAmount = operation === 'add' ? currentPoints + amount : operation === 'sub' ? currentPoints - amount : amount;
                account.set('points', newAmount);

                await sendNotification(player, type, amount, newAmount, operation);
                return true;
            }
        }
        return false;
    }

    async function add(params: PlayerParams, type: string, amount: number) {
        return await handleCharacter(params, type, amount, 'add');
    }

    async function sub(params: PlayerParams, type: string, amount: number) {
        return await handleCharacter(params, type, amount, 'sub');
    }

    async function set(params: PlayerParams, type: string, amount: number) {
        return await handleCharacter(params, type, amount, 'set');
    }

    async function get(params: PlayerParams, type: string) {
        const { player, characterId } = params;

        if (!player) {
            const playerData = await db.getMany<{ _id: string } & Character>({ id: characterId }, CollectionNames.Characters);
            if (!playerData || playerData.length === 0) {
                return false;
            }
            if (type === 'cash' || type === 'bank') {
                return playerData[0][type];
            }

            if (type === 'points') {
                const accountData = await db.getMany<{ _id: string } & Account>({ _id: playerData[0].account_id }, CollectionNames.Accounts);
                if (!accountData || accountData.length === 0) {
                    return false;
                }
                return accountData[0].points;
            }
        } else {
            const character = Rebar.document.character.useCharacter(player);
            if (type === 'cash' || type === 'bank') {
                return character.getField(type);
            }

            if (type === 'points') {
                const account = Rebar.document.account.useAccount(player);
                return account.getField('points');
            }
        }
        return false;
    }


    async function cost(params: PlayerParams,  amount: number) {
        const cash = await get(params, 'cash');
        const bank = await get(params, 'bank');
        const all = cash + bank;
        if (all < amount) {
            return false;
        }
        if(amount < cash) {
            await sub(params, 'cash', amount);
            return true;
        } else {
            await sub(params, 'cash', cash);
            await sub(params, 'bank', amount - cash);
            return true;
        }
    }




    return {
        add,
        sub,
        set,
        get,
        cost,
    };
}

Rebar.useApi().register(API_NAME, useApi());







import atm from '../shared/atm.js';

atm.forEach((atm, index) => {
    const atmId = index + 1; // 动态生成ATM的ID，从1开始

    const atminter = Rebar.controllers.useInteraction(new alt.ColshapeCylinder(atm.x, atm.y, atm.z, 5, 2), 'any');

    atminter.onEnter(async (player: alt.Player, colshape: alt.Colshape, uid: string) => {
        if (!player) {
            return;
        }
        const promptbar = await Rebar.useApi().getAsync('promptbar-api');
        promptbar.showPromptBar(player, `按E打开ATM机`);
    });

    atminter.onLeave(async (player: alt.Player, colshape: alt.Colshape, uid: string) => {
        if (!player) {
            return;
        }
        const promptbar = await Rebar.useApi().getAsync('promptbar-api');
        promptbar.hidePromptBar(player);
    });




    const blip = Rebar.controllers.useBlipGlobal({
        color: 25,
        pos: new alt.Vector3(atm.x, atm.y, atm.z),
        shortRange: true,
        sprite: 276,
        text: `ATM`, // 使用动态生成的ID
    });
});
