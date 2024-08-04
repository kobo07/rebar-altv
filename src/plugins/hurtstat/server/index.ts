import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { Character } from '@Shared/types/character.js';
import { useWebview } from '@Server/player/webview.js';


const Rebar = useRebar();
const serverConfig = Rebar.useServerConfig();
const Keybinder = Rebar.systems.useKeybinder();



declare global {
    export interface ServerPlugin {
        ['hurt-api']: ReturnType<typeof useApi>;
    }
}

declare module '@Shared/types/character.js' {
    export interface Character {
        hurt: DamageRecord[]
    }
}

export interface DamageRecord {
    attackNumber: number;
    timestamp: string;
    healthDamage: number;
    attackerType: string;
    attackerTypeDescription: string;
}


/*declare module 'alt-shared' {
    export interface ICustomEntityStreamSyncedMeta {
        hurt?: number;
    }
}*/



/*const SyncedBinder = Rebar.systems.useStreamSyncedBinder();
SyncedBinder.syncCharacterKey('hurt')*/

/*Rebar.events.useEvents().on('character-bound', (player: alt.Player, document: Character) => {
    const hurt = document.hurt;
    alt.emitClient(player, 'hurt:sync', hurt);
});

Rebar.document.character.useCharacterEvents().on('hurt', (player, newValue, oldValue) => {
    alt.emitClient(player, 'hurt:sync', newValue);
}
);*/


/**
 * 在玩家创建角色后给予伤害的文档参数
 */
function givecharacterdefaultdata(player: alt.Player) {
    const doc = Rebar.document.character.useCharacter(player);
    if (!doc) {
        return;
    }
    doc.set('hurt', []);
}

// 玩家创建角色时触发
const api = Rebar.useApi();
const charSelectApi = api.get('character-creator-api');
charSelectApi.onCreate(givecharacterdefaultdata);




const environment = {
    fire: { hash: 615608432, description: '火焰烧伤' },
    rocketExplosion: { hash: 883325847, description: '火箭筒爆炸伤' },
    drowning: { hash: 1936677264, description: '溺水伤害' },
    fall: { hash: 3452007600, description: '高处坠落伤' },
    runOver: { hash: 2741846334, description: '被车辆撞伤' },
    explosion: { hash: 341774354, description: '爆炸伤害' },
    gas: { hash: 4284007675, description: '毒气伤害' },
    electricFence: { hash: 2461879995, description: '电击伤害' },
    barbedWire: { hash: 1223143800, description: '铁丝网伤害' },
    bulletproofTire: { hash: 2741846334, description: '防弹轮胎伤害' },
    animal: { hash: 148160082, description: '动物攻击伤' }
};

alt.on('playerDamage', async (victim: alt.Player, attacker: alt.Entity, healthDamage: number, armourDamage: number, weaponHash: number) => {
    if (healthDamage <= 1) {
        return;
    }
    if (armourDamage && !healthDamage) {
        return;
    }
    const oldAttackLabel = await useApi().get(victim);
    if (!oldAttackLabel) {
        return;
    }
    const attackNumber = oldAttackLabel.length + 1;

    let attackerType = '伤害来源';
    let attackerTypeDescription = '伤害鉴定';

    if (attacker instanceof alt.Player) {
        attackerType = victim === attacker ? '自残' : '被人打了';
        const envHash = Object.values(environment).find(env => env.hash === weaponHash);
        if (envHash) {
            attackerTypeDescription = envHash.description;
        }
    } else if (attacker instanceof alt.Vehicle) {
        attackerType = '交通事故';
    } else if (attacker instanceof alt.Object || attacker === null) {
        const envHash = Object.values(environment).find(env => env.hash === weaponHash);
        if (envHash) {
            attackerType = '环境伤害';
            attackerTypeDescription = envHash.description;
        } else if (weaponHash === 0 && healthDamage === 8) {
            attackerType = '溺水';
        } else {
            attackerType = '可能是低血糖';
        }
    } else {
        alt.log('未知:', attacker, attackerType, healthDamage, armourDamage, weaponHash);
        return;
    }

    console.log(attackerType, healthDamage, armourDamage, weaponHash);


    if (weaponHash) {
        const smallCaliberHandguns = [
            453432689, // Pistol
            1593441988, // Combat Pistol
            584646201, // AP Pistol
            911657153, // Stun Gun
            3218215474, // SNS Pistol
            2508868239, // Heavy Pistol
            137902532, // Vintage Pistol
            727643628, // Ceramic Pistol
            2548703416, // Double Action Revolver
            1470379660, // Perico Pistol
            3523564046, // Heavy Revolver
            3249783761, // Heavy Revolver Mk II
            3696079510, // Marksman Pistol
            2441047180, // Navy Revolver
            2939590305, // Up-n-Atomizer
            3219281620, // Pistol Mk II
            2285322324 // SNS Pistol Mk II
        ];

        const shotguns = [
            487013001, // Pump Shotgun
            2017895192, // Sawn-Off Shotgun
            2640438543, // Bullpup Shotgun
            3800352039, // Assault Shotgun
            1432025498, // Pump Shotgun Mk II
            2828843422, // Musket
            984333226, // Heavy Shotgun
            4019527611, // Double Barrel Shotgun
            317205821, // Sweeper Shotgun
            94989220 // Combat Shotgun
        ];

        const rifles = [
            3220176749, // Assault Rifle
            2210333304, // Carbine Rifle
            2937143193, // Advanced Rifle
            3231910285, // Special Carbine
            2132975508, // Bullpup Rifle
            961495388, // Assault Rifle Mk II
            4208062921, // Carbine Rifle Mk II
            2228681469, // Bullpup Rifle Mk II
            1649403952, // Compact Rifle
            2636060646, // Military Rifle
            2526821735 // Special Carbine Mk II
        ];

        const blades = [
            2578778090, // Knife
            1737195953, // Nightstick
            1317494643, // Hammer
            2508868239, // Bat
            4191993645, // Crowbar
            3441901897, // Battle Axe
            3638508604, // Knuckle Duster
            4192643659, // Broken Bottle
            3713923289, // Machete
            3756226112, // Switchblade
            419712736, // Wrench
            2484171525, // Pool Cue
            940833800 // Stone Hatchet
        ];

        const bluntWeapons = [
            2227010557, // Crowbar
            2460120199, // Bat
            1141786504 // Golf Club
        ];

        const explosives = [
            2481070269, // Grenade
            2726580491, // Sticky Bomb
            2874559379, // Proximity Mine
            600439132, // Pipe Bomb
            1446246869, // Molotov Cocktail
            2138347493, // Firework
            1305664598, // Smoke Grenade
            2694266206, // BZ Gas
            4256991824, // Tear Gas
            741814745 // Jerry Can
        ];

        const unarmed = [
            2725352035 // Unarmed
        ];


        if (smallCaliberHandguns.includes(weaponHash)) {
            attackerTypeDescription = '小口径手枪弹贯穿伤';
        } else if (shotguns.includes(weaponHash)) {
            attackerTypeDescription = '霰弹枪弹撕裂伤';
        } else if (rifles.includes(weaponHash)) {
            attackerTypeDescription = '步枪弹穿透伤';
        } else if (blades.includes(weaponHash)) {
            attackerTypeDescription = '利器割裂伤';
        } else if (bluntWeapons.includes(weaponHash)) {
            attackerTypeDescription = '钝器重击伤';
        } else if (explosives.includes(weaponHash)) {
            attackerTypeDescription = '爆炸物伤害';
        } else if (unarmed.includes(weaponHash)) {
            attackerTypeDescription = '肉搏伤害';
        }
    }

    const now = new Date();
    const formatNumber = (number: number) => number.toString().padStart(2, '0');

    const attackLabel: DamageRecord = {
        attackNumber,
        timestamp: `${formatNumber(now.getMonth() + 1)}月 ${formatNumber(now.getDate())}日 ${formatNumber(now.getHours())}时${formatNumber(now.getMinutes())}分${formatNumber(now.getSeconds())}秒`,
        healthDamage,
        attackerType,
        attackerTypeDescription
    };

    const allAttackLabel = [...oldAttackLabel, attackLabel];
    await useApi().set(victim, allAttackLabel);
});






function useApi() {
    async function get(player: alt.Player) {
        if (!player) {
            return false
        }
        const hurt = Rebar.document.character.useCharacter(player).getField('hurt')
        return hurt
    }

    async function set(player: alt.Player, hurt: DamageRecord[]) {
        if (!player) {
            return false
        }
        const character = Rebar.document.character.useCharacter(player)
        if (!character) {
            return false
        }
        character.set('hurt', hurt)
        return true
    }

    async function add(player: alt.Player, healthDamage: number, attackerType: string, attackerTypeDescription: string,) {

        const oldHurt = await get(player)
        if (!oldHurt) {
            return false
        }

        const now = new Date();
        const formatNumber = (number) => number.toString().padStart(2, '0');

        const newHurt = [...oldHurt, {
            attackNumber: oldHurt.length + 1,
            timestamp: `${formatNumber(now.getMonth() + 1)}月 ${formatNumber(now.getDate())}日 ${formatNumber(now.getHours())}时${formatNumber(now.getMinutes())}分${formatNumber(now.getSeconds())}秒`,
            healthDamage,
            attackerType,
            attackerTypeDescription
        }]
        set(player, newHurt)
        return true
    }

    async function sub(player: alt.Player, attackNumber: number) {
        const oldHurt = await get(player)
        if (!oldHurt) {
            return false
        }
        const newHurt = oldHurt.filter((hurt) => hurt.attackNumber !== attackNumber)
        return set(player, newHurt)
    }


    async function cure(player: alt.Player, attackNumber: number) {
        const oldHurt = await get(player)
        if (!oldHurt) {
            return false
        }
        const hurt = oldHurt.find((hurt) => hurt.attackNumber === attackNumber)
        const newHurt = oldHurt.filter((hurt) => hurt.attackNumber !== attackNumber)
        player.health += hurt.healthDamage
        return set(player, newHurt)
    }

    async function allcure(player: alt.Player) {
        const oldHurt = await get(player)
        if (!oldHurt) {
            return false
        }
        const newHurt = []
        player.health = 200
        return set(player, newHurt)
    }


    return {
        get,
        set,
        add,
        sub,
        cure,
        allcure,
    }
}


Rebar.useApi().register('hurt-api', useApi());










Keybinder.on(113, (player) => {
    const ped = Rebar.controllers.usePed(new alt.Ped('mp_m_freemode_01', player.pos, alt.Vector3.zero, 100));
    const ped1 = new alt.Ped('mp_m_freemode_01', player.pos, alt.Vector3.zero, 100)

    ped1.currentWeapon = alt.hash('pistol50')

})