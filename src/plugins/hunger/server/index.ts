import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { CollectionNames } from '@Server/document/shared.js';
import { useDatabase } from '@Server/database/index.js';
import { log } from 'console';
import { Character } from '@Shared/types/character.js';

const API_NAME = 'hunger-api';
const Rebar = useRebar();
const event = Rebar.events.useEvents();
const api = Rebar.useApi();
const SyncedBinder = Rebar.systems.useStreamSyncedBinder();


declare module '@Shared/types/character.js' {
    interface Character {
      shit?: number;
    }
  }






/**
 * 在玩家选择角色后将食物系统文档参数自动更新至玩家的streamsyncedmeta
 * 
 * 开始消耗食物，消耗饮水，增加粪便值。
 */
  function starthunger(player: alt.Player, doc: Character) {
    SyncedBinder.syncCharacterKey('water');
    SyncedBinder.syncCharacterKey('food');
    SyncedBinder.syncCharacterKey('shit');
    alt.emitClient(player, 'hunger:start');
}

// 玩家选择角色后角色文档绑定至玩家时触发
event.on('character-bound', starthunger);




alt.onClient('hunger:hurt', (player: alt.Player, type: string) => {
    if (type == 'food') {
        player.health -= 20;
        Rebar.usePlayer(player).notify.showNotification('你感到饥饿');
    }
    if(type == 'water') {
        player.health -= 20;
        Rebar.usePlayer(player).notify.showNotification('你感觉很渴');
    }
}
)

alt.onClient('hunger:update', (player: alt.Player, food: number, water: number, shit: number) => {
    Rebar.document.character.useCharacter(player).setBulk({'food': food, 'water': water, 'shit': shit});
}
)




alt.onClient('hunger:shit', (player: alt.Player) => {
    shit(player);
}
)
/**
 * 播放拉屎动画并且生成一坨屎,并将便意设置为0
 * 
 * @param player 玩家
 */
export function shit(player: alt.Player) {
    Rebar.usePlayer(player).animation.playFinite('missfbi3ig_0', 'shit_loop_trev', 31, 10000,true);
    Rebar.controllers.useObjectGlobal({ model: alt.hash('prop_big_shit_02'), pos:{x: player.pos.x, y:player.pos.y, z: player.pos.z-1} });
    Rebar.document.character.useCharacter(player).set('shit', 0);
}







/**
 * 在玩家创建角色后给予食物系统相关的文档参数
 */
function givecharacterdefaultdata(player: alt.Player) {
    const doc = Rebar.document.character.useCharacter(player)
    if (!doc) {
        return;
    }
    doc.set('food', 100);
    doc.set('water', 100);
    doc.set('shit',0);
}
// 玩家创建角色时触发
const charSelectApi = api.get('character-creator-api');
charSelectApi.onSkipCreate(givecharacterdefaultdata);








declare global {
    export interface ServerPlugin {
        ['hunger-api']: ReturnType<typeof useApi>;
    }
}

type hungersystem = {
    food: string;
    water: string;
    shit: string;
};

type HungerSystemKeys = keyof hungersystem;


/*
* 食物系统API
*/
function useApi() {
    function add(player: alt.Player, type: HungerSystemKeys, amount: number) {
        const doc = Rebar.document.character.useCharacter(player);
        if (!doc) {
            log('食物系统add失败，找不到玩家');
            return false
        }
        const currentValue = doc.getField(type);
        const newValue = Math.min(100, Math.max(0, currentValue + amount));
        doc.set(type, newValue);
        return true;
    }


    function sub(player: alt.Player, type: HungerSystemKeys, amount: number) {
        const doc = Rebar.document.character.useCharacter(player);
        if (!doc) {
            log('食物系统sub失败，找不到玩家');
            return false
        }
        const currentValue = doc.getField(type);
        const newValue = Math.min(100, Math.max(0, currentValue - amount));
        doc.set(type, newValue);
        return true;
    }

    function set (player: alt.Player, type: HungerSystemKeys, amount: number) {
        const doc = Rebar.document.character.useCharacter(player);
        if (!doc) {
            log('食物系统set失败，找不到玩家');
            return false
        }
        const newValue = Math.min(100, Math.max(0,amount ));
        doc.set(type, newValue);
        return true;
    }

    return {
        add,
        sub,
        set
    };
}



Rebar.useApi().register(API_NAME, useApi());

