import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import * as Utility from '@Shared/utility/index.js';
import { Character } from '@Shared/types/character.js';
import { CollectionNames } from '@Server/document/shared.js';

const Rebar = useRebar();
const messenger = Rebar.messenger.useMessenger();
const db = Rebar.database.useDatabase();



db.createCollection('item');
db.createCollection('storage');



/*const SyncedBinder = Rebar.systems.useStreamSyncedBinder();
SyncedBinder.syncCharacterKey('inventory')
SyncedBinder.syncCharacterKey('capacity')
SyncedBinder.syncCharacterKey('allWeightInBag')*/



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
        allWeightInBag: number;
    }
}

declare module 'alt-shared' {
    export interface ICustomEntityStreamSyncedMeta {
        inventory?: BagItem[];
        capacity?: number;
        allWeightInBag?: number;
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
    CustomOption?: string[];
    model?: string;
}

export interface BagItem extends BaseItem {
    quantity: number;
    slot: number;
    customData?: any;
    equiped?: boolean;
    cooling?: number;
    totalWeight: number;
}

interface Storage {
    name: string;
    capacity: number;
    content: BagItem[];
    belongsTo: master;
    position?: alt.Vector3;
    canrent?: boolean;
    isrent?: rent;
}

interface master {
    characterid?: number
    faction?: string
    gov?: boolean
}

interface rent {
    starttime?: number
    endtime?: number
    price: number
    isrent: boolean
    rentmanid: number
}



const allstorages = await db.getAll<{ _id: string } & Storage>('storage');
const allstorageslenth = allstorages.length;
if (allstorageslenth > 0) {
    for (let i = 0; i < allstorageslenth; i++) {
        const storage = allstorages[i];
        const storagename = storage.name;
        const capacity = storage.capacity;
        const pos = storage.position;
        const belongsTo = storage.belongsTo;
        const canrent = storage.canrent;
        const isrent = storage.isrent;
        createInteraction(capacity, pos, canrent, belongsTo, storagename, isrent);
    }
}

function createInteraction(capacity: number, pos: alt.Vector3, canrent: boolean, belongsTo: master, storagename: string, isrent: rent) {
    const isiteractionexisting = alt.ColshapeCircle.all.find(colshape => colshape.pos.x === pos.x && colshape.pos.y === pos.y && colshape.pos.z === pos.z)
    if (isiteractionexisting) {
        return;
    }
    const storage = Rebar.controllers.useInteraction(new alt.ColshapeCylinder(pos.x, pos.y, pos.z, 5, 2), 'player')

    Rebar.controllers.useBlipGlobal({
        pos: pos,
        color: 3,
        sprite: canrent ? isrent.isrent ? 473 : 474 : 473,
        shortRange: true,
        text: storagename,
    })

    storage.on(handlestorage);
}

function handlestorage(player: alt.Player, colshape: alt.Colshape, uid: string) {
    const storageData = Rebar.database.useDatabase().getMany<Storage>({}, 'storage');
}










function useApi() {
    async function createitem(item: BaseItem) {
        const itemexiting = await db.getMany<{ _id: string } & BaseItem>({ name: item.name }, 'item');
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






type InventoryParams = {
    storage?: string;
    player?: alt.Player;
    characterId?: number;
};

async function sendInventoryNotification(player: alt.Player, itemName: string, quantity: number, operation: string) {
    const notify = await Rebar.useApi().getAsync('ascended-notification-api');
    notify.create(player, {
        icon: '🎒',
        title: '库存',
        subTitle: '物品变动',
        message: operation === 'add' ? `你获得了 ${quantity} 个 ${itemName} `
            : `你失去了 ${quantity} 个 ${itemName}。`,
    });
}

function useInventory() {
    async function getInventory(params: InventoryParams): Promise<BagItem[] | null> {
        const { storage, player, characterId } = params;

        if (storage) {
            const storageData = await db.getMany<Storage>({ name: storage }, 'storage');
            if (storageData.length <= 0) {
                console.warn('Storage not found.');
                return null;
            }
            return storageData[0].content;
        } else if (player) {
            return Rebar.document.character.useCharacter(player).getField('inventory');
        } else if (characterId) {
            const playerData = await db.getMany<{ _id: string } & Character>({ id: characterId }, CollectionNames.Characters);
            if (playerData.length <= 0) {
                console.warn('Player not found.');
                return null;
            }
            return playerData[0].inventory;
        } else {
            console.warn('Either player, storage, or characterId must be provided.');
            return null;
        }
    }

    async function updateInventory(inventory: BagItem[], params: InventoryParams) {
        const { storage, player, characterId } = params;

        if (storage) {
            const storageData = await db.getMany<{ _id: string } & Storage>({ name: storage }, 'storage');
            if (storageData.length > 0) {
                const _id = storageData[0]._id;
                await db.update({ _id, content: inventory }, 'storage');
            }
        } else if (player) {
            Rebar.document.character.useCharacter(player).set('inventory', inventory);
        } else if (characterId) {
            const playerData = await db.getMany<{ _id: string } & Character>({ id: characterId }, CollectionNames.Characters);
            if (playerData.length > 0) {
                const _id = playerData[0]._id;
                await db.update({ _id, inventory }, CollectionNames.Characters);
            }
        } else {
            console.warn('Either player, storage, or characterId must be provided.');
        }
    }


    async function addItem(itemName: string, quantity: number, params: InventoryParams, customData?: any) {
        const { storage, player, characterId } = params;
    
        if (!player && !storage && !characterId) {
            console.warn('Either player, storage, or characterId must be provided.');
            return;
        }
    
        const item = await useApi().getitem(itemName);
        if (!item) {
            console.warn('Item not found.');
            return;
        }
    
        const inventory = await getInventory(params);
        if (!inventory) {
            console.warn('Inventory not found.');
            return;
        }
    
        // 计算当前库存的总权重
        let currentWeight = inventory.reduce((total, i) => total + i.totalWeight, 0);
        const itemWeight = item.weight * quantity;
    
        // 根据参数是否包含player, storage或characterId来确定容量
        let capacity: number;
    
        if (player) {
            capacity = Rebar.document.character.useCharacter(player).getField('capacity');
        } else if (storage) {
            const storageData = await db.getMany<{ _id: string } & Storage>({ name: storage }, 'storage');
            if (storageData.length > 0) {
                capacity = storageData[0].capacity;
            } else {
                console.warn('Storage not found.');
                return;
            }
        } else if (characterId) {
            const playerData = await db.getMany<{ _id: string } & Character>({ id: characterId }, CollectionNames.Characters);
            if (playerData.length > 0) {
                capacity = playerData[0].capacity;
            } else {
                console.warn('Character not found.');
                return;
            }
        } else {
            console.warn('Capacity source not found.');
            return;
        }
    
        // 检查添加的项目是否超出容量
        if (currentWeight + itemWeight > capacity) {
            console.warn('Not enough capacity.');
            return;
        }
    
        let remainingQuantity = quantity;
    
        while (remainingQuantity > 0) {
            const index = inventory.findIndex(i => i.name === itemName && (i.customData ? i.customData === customData : true) && i.quantity < item.maxStack);
    
            if (index !== -1) {
                const spaceAvailable = item.maxStack - inventory[index].quantity;
                if (remainingQuantity <= spaceAvailable) {
                    inventory[index].quantity += remainingQuantity;
                    inventory[index].totalWeight = inventory[index].quantity * item.weight;
                    remainingQuantity = 0;
                } else {
                    inventory[index].quantity = item.maxStack;
                    inventory[index].totalWeight = inventory[index].quantity * item.weight;
                    remainingQuantity -= spaceAvailable;
                }
            } else {
                const quantityToAdd = Math.min(remainingQuantity, item.maxStack);
                inventory.push({
                    ...item,
                    quantity: quantityToAdd,
                    slot: inventory.length,
                    customData: customData,
                    totalWeight: quantityToAdd * item.weight
                });
                remainingQuantity -= quantityToAdd;
            }
        }
    
        currentWeight = inventory.reduce((total, i) => total + i.totalWeight, 0);
        if (player) {
            Rebar.document.character.useCharacter(player).set('allWeightInBag', currentWeight);
        } else if (characterId) {
            const playerData = await db.getMany<{ _id: string } & Character>({ id: characterId }, CollectionNames.Characters);
            if (playerData.length > 0) {
                const _id = playerData[0]._id;
                await db.update({ _id, allWeightInBag: currentWeight }, CollectionNames.Characters);
            }
        }
    
        await updateInventory(inventory, params);
    
        if (player) {
            await sendInventoryNotification(player, itemName, quantity, 'add');
        }
    }
    
    async function subItem(itemName: string, quantity: number, params: InventoryParams, slot?: number) {
        const { storage, player, characterId } = params;
    
        if (!player && !storage && !characterId) {
            console.warn('Either player, storage, or characterId must be provided.');
            return;
        }
    
        const inventory = await getInventory(params);
        if (!inventory) {
            console.warn('Inventory not found.');
            return;
        }
    
        if (slot !== undefined) {
            // 针对指定的slot处理
            const index = inventory.findIndex((i) => i.slot === slot && i.name === itemName);
            if (index === -1) {
                console.warn('Item not found in the specified slot.');
                return;
            }
    
            if (inventory[index].quantity < quantity) {
                console.warn('Not enough quantity in the specified slot.');
                return;
            }
    
            inventory[index].quantity -= quantity;
            inventory[index].totalWeight = inventory[index].quantity * inventory[index].weight;
            if (inventory[index].quantity <= 0) {
                inventory.splice(index, 1);
            }
        } else {
            // 处理没有指定slot的情况
            let remainingQuantity = quantity;
            const items = inventory.filter((i) => i.name === itemName).sort((a, b) => a.quantity - b.quantity);
    
            if (items.reduce((acc, item) => acc + item.quantity, 0) < quantity) {
                console.warn('Not enough quantity in the inventory.');
                return;
            }
    
            for (const item of items) {
                if (remainingQuantity <= 0) break;
    
                if (item.quantity > remainingQuantity) {
                    item.quantity -= remainingQuantity;
                    item.totalWeight = item.quantity * item.weight;
                    remainingQuantity = 0;
                } else {
                    remainingQuantity -= item.quantity;
                    item.quantity = 0;
                    item.totalWeight = 0;
                }
            }
    
            // 移除数量为0的项
            for (let i = inventory.length - 1; i >= 0; i--) {
                if (inventory[i].quantity <= 0) {
                    inventory.splice(i, 1);
                }
            }
        }
    
        const currentWeight = inventory.reduce((total, i) => total + i.totalWeight, 0);
        if (player) {
            Rebar.document.character.useCharacter(player).set('allWeightInBag', currentWeight);
        } else if (characterId) {
            const playerData = await db.getMany<{ _id: string } & Character>({ id: characterId }, CollectionNames.Characters);
            if (playerData.length > 0) {
                const _id = playerData[0]._id;
                await db.update({ _id, allWeightInBag: currentWeight }, CollectionNames.Characters);
            }
        }
    
        await updateInventory(inventory, params);
    
        if (player) {
            await sendInventoryNotification(player, itemName, quantity, 'sub');
        }
    }
    



    async function createstorge(storagename: string, capacity: number, pos: alt.Vector3, belongsTo: master, canrent?: boolean, price?: number) {
        const storagedata = await db.getMany<{ _id: string } & Storage>({ name: storagename }, 'storage');
        if (storagedata.length > 0) {
            return;
        }
        db.create({ name: storagename, capacity: capacity, pos: pos, belongsTo: belongsTo, canrent: canrent, isrent: { isrent: false, price: price } }, 'storage');
    }


    async function deletestorage(storagename: string) {
        const storagedata = await db.getMany<{ _id: string } & Storage>({ name: storagename }, 'storage');
        if (storagedata.length <= 0) {
            return;
        }
        db.deleteDocument(storagedata[0]._id, 'storage');
    }


    async function rentstorage(storagename: string, rentplayer: alt.Player) {
        const storagedata = await db.getMany<{ _id: string } & Storage>({ name: storagename }, 'storage');
        if (storagedata.length <= 0) {
            return;
        }
        if (!storagedata[0].canrent) {
            return;
        }

        const currency = await Rebar.useApi().getAsync('currency-api');
        const price = storagedata[0].isrent.price;
        const rentDuration = 7 * 24 * 60 * 60 * 1000; // 一周的毫秒数
        const endTime = Date.now() + rentDuration;

       const trycost = await currency.cost({ player: rentplayer }, price);
       if(!trycost){
            return;
       }

       if(storagedata[0].belongsTo.characterid){
        const owner = await db.getMany<{ _id: string } & Character>({ id: storagedata[0].belongsTo.characterid }, CollectionNames.Characters);
        if(owner.length > 0){
           currency.add({characterId: owner[0].id},'bank', price);
        }  
       }

   

        db.update({ _id: storagedata[0]._id, isrent: { starttime: Date.now(), endtime: endTime, isrent: true, rentmanid: Rebar.document.character.useCharacter(rentplayer).getField('id') } }, 'storage');
    }




    return {
        addItem,
        subItem,
        updateInventory,
        getInventory,
        createstorge,
        deletestorage,
        rentstorage,
    };
}

Rebar.useApi().register('inventory-api', useInventory());







useApi().createitem({
    name: '大剑',
    desc: '就是一把大剑',
    type: '武器',
    icon: 'sword.png',
    weight: 1,
    maxStack: 20,
}
)

useApi().createitem({
    name: '魔方',
    desc: '就是一个魔方',
    type: '工具',
    icon: 'rubik.png',
    weight: 1,
    maxStack: 20,
}
)



Rebar.useKeybinder().on(82, (player) => {//R
    useInventory().addItem('大剑', 1, { player: player });
    useInventory().addItem('魔方', 1, { player: player });
})







alt.onClient('changeitemslot', async (player: alt.Player, fromSlot: number, toSlot: number) => {
    const inventory = await useInventory().getInventory({ player: player });
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
        await useInventory().updateInventory(inventory, { player: player });
        sendinventory(player);
        return;
    }

    fromItem.slot = toSlot;
    toItem.slot = fromSlot;
    await useInventory().updateInventory(inventory, { player: player });
    sendinventory(player);
});






alt.onClient('GetInventory', async (player: alt.Player) => {
    const inventory = await useInventory().getInventory({ player: player });
    if (!inventory) {
        return;
    }
    Rebar.player.useWebview(player).emit('sendinventory', inventory);
});

async function sendinventory(player: alt.Player) {
    const inventory = await useInventory().getInventory({ player: player });
    if (!inventory) {
        return;
    }
    Rebar.player.useWebview(player).emit('sendinventory', inventory);
}