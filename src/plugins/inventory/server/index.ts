import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import * as Utility from '@Shared/utility/index.js';
import { Character } from '@Shared/types/character.js';

const Rebar = useRebar();
const messenger = Rebar.messenger.useMessenger();
const db = Rebar.database.useDatabase();



db.createCollection('item');
db.createCollection('storage');



const SyncedBinder = Rebar.systems.useStreamSyncedBinder();
SyncedBinder.syncCharacterKey('inventory')
SyncedBinder.syncCharacterKey('capacity')



declare global {
    export interface ServerPlugin {
        ['dbitem-api']: ReturnType<typeof useApi>;
        ['inventory-api']: ReturnType<typeof useInventory>;
    }
}

declare module '@Shared/types/character.js' {
    export interface Character {
        inventory: BagItem[];
        capacity: number;
    }
}

type ItemType = '武器' | '消耗品' | '材料' | '工具' | '钥匙' | '衣服';

type EffectCallback = (player: alt.Player, ...args: any[]) => void;

interface BaseItem {
    name: string;
    icon: string;
    desc: string;
    weight: number;
    type: ItemType;
    maxStack: number;
    effect?: EffectCallback;
    CustomOption?:string[];
    model?: string;
}

export interface BagItem extends BaseItem {
    quantity: number;
    slot: number;
    customData?: any;
    equiped?: boolean;
    cooling?: number;
}

interface Storage {
    name: string;
    capacity: number;
    content: BagItem[];
    belongsTo?: string;
    isrent?: boolean;
    position?: alt.Vector3;
}






function useApi() {
    async function createitem(item: BaseItem) {
        const itemexiting = await  db.getMany<{ _id: string } & BaseItem>({ name: item.name }, 'item');
        if (itemexiting.length > 0) {
            return;
        }
        db.create(item, 'item');
    }

    async function deleteitem(itemname: string) {
        const items = await db.getMany<{ _id: string } & BaseItem>({ name: itemname }, 'item');
        if (items.length <= 0) {
            console.warn('Could not find the data!');
            return;
        }
        const item = items[0];
        await db.deleteDocument(item._id, 'item');
    }

    async function getitem(itemname: string): Promise<({ _id: string } & BaseItem) | null> {
        const items = await db.getMany<{ _id: string } & BaseItem>({ name: itemname }, 'item');
        if (items.length <= 0) {
            console.warn('Could not find the data!');
            return null;
        }
        return items[0];
    }

    async function updateitem(itemname: string, updates: Partial<BaseItem>) {
        const items = await db.getMany<{ _id: string } & BaseItem>({ name: itemname }, 'item');
        if (items.length <= 0) {
            console.warn('Could not find the data!');
            return;
        }
        const item = items[0];
        const _id = item._id;
        await db.update({ _id, updates }, 'item');
    }

    async function getallitems() {
        const items = await db.getAll<{ _id: string } & BaseItem>('item');
        return items;
    }

    return {
        createitem,
        deleteitem,
        getitem,
        updateitem,
        getallitems
    };
}

Rebar.useApi().register('dbitem-api', useApi());





/**
 * 在玩家创建角色后给予背包的文档参数
 */
function givecharacterdefaultdata(player: alt.Player) {
    const doc = Rebar.document.character.useCharacter(player);
    if (!doc) {
        return;
    }
    doc.set('inventory', []);
    doc.set('capacity', 25);
}

// 玩家创建角色时触发
const api = Rebar.useApi();
const charSelectApi = api.get('character-creator-api');
charSelectApi.onCreate(givecharacterdefaultdata);










function useInventory() {
    async function getInventory(storage?: string, player?: alt.Player): Promise<BagItem[] | null> {
        if (storage) {
            const storageData = await db.getMany<Storage>({ name: storage }, 'storage');
            if (storageData.length <= 0) {
                console.warn('Storage not found.');
                return null;
            }
            return storageData[0].content;
        } else if (player) {
            return Rebar.document.character.useCharacter(player).getField('inventory');
        }
        return null;
    }

    async function updateInventory(inventory: BagItem[], storage?: string, player?: alt.Player) {
        if (storage) {
            const storageData = await db.getMany<{ _id: string } &Storage>({ name: storage }, 'storage');
            if (storageData.length > 0) {
                const _id = storageData[0]._id;
                await db.update({ _id, content: inventory }, 'storage');
            }
        } else if (player) {
            Rebar.document.character.useCharacter(player!).set('inventory', inventory);
        }
    }

    async function additem(itemname: string, quantity: number, storage?: string, player?: alt.Player, customData?: any) {
        if (!player && !storage) {
            console.warn('Either player or storage must be provided.');
            return;
        }

        const item = await useApi().getitem(itemname);
        if (!item) {
            console.warn('Item not found.');
            return;
        }

        const inventory = await getInventory(storage, player);
        if (!inventory) {
            console.warn('Inventory not found.');
            return;
        }

        const index = inventory.findIndex((i) => i.name === itemname && i.customData === customData);
        if (index !== -1) {
            inventory[index].quantity += quantity;
        } else {
            inventory.push({
                ...item,
                quantity: quantity,
                slot: inventory.length,
                customData: customData
            });
        }

        await updateInventory(inventory, storage, player);
    }

    async function subitem(itemname: string, quantity: number, storage?: string, player?: alt.Player, slot?: number) {
        if (!player && !storage) {
            console.warn('Either player or storage must be provided.');
            return;
        }

        const inventory = await getInventory(storage, player);
        if (!inventory) {
            console.warn('Inventory not found.');
            return;
        }

        let index;
        if (slot !== undefined) {
            index = inventory.findIndex((i) => i.slot === slot && i.name === itemname);
        } else {
            index = inventory.findIndex((i) => i.name === itemname);
        }

        if (index !== -1) {
            inventory[index].quantity -= quantity;
            if (inventory[index].quantity <= 0) {
                inventory.splice(index, 1);
            }
        } else {
            console.warn('Item not found in inventory.');
            return;
        }

        await updateInventory(inventory, storage, player);
    }

    return {
        additem,
        subitem,
        updateInventory,
        getInventory,
    };
}

Rebar.useApi().register('inventory-api', useInventory());





useApi().createitem({
    name: '大剑',
    desc: '就是一把大剑',
    type: '武器',
    icon: 'sword.png',
    weight: 1,
    maxStack: 1,
}
)

useApi().createitem({
    name: '魔方',
    desc: '就是一个魔方',
    type: '工具',
    icon: 'rubik.png',
    weight: 1,
    maxStack: 1,
}
)



Rebar.useKeybinder().on(82, (player) => {
    useInventory().additem('大剑', 1, undefined, player);
    useInventory().additem('魔方', 1, undefined, player);
    Rebar.usePlayer(player).notify.showNotification('获得大剑*1');
    
})



alt.onClient('UpdateInventory', (player, inventory) => {
    useInventory().updateInventory(inventory, undefined, player);
}
)



alt.onClient('changeitemslot', async (player: alt.Player, fromSlot: number, toSlot: number) => {
    const inventory = await useInventory().getInventory(undefined, player);
    if (!inventory) {
        return;
    }
    if (fromSlot === toSlot) {
        return;
    }

    const fromItem = inventory.find(i => i.slot === fromSlot);
    if (!fromItem) {
        return;
    }

    const toItem = inventory.find(i => i.slot === toSlot);

    if (!toItem) {
        fromItem.slot = toSlot;
        await useInventory().updateInventory(inventory, undefined, player);
        return;
    }

    fromItem.slot = toSlot;
    toItem.slot = fromSlot;
    await useInventory().updateInventory(inventory, undefined, player);
});
