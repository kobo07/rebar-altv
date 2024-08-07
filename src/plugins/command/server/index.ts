import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';


const Rebar = useRebar();
const messenger = Rebar.messenger.useMessenger();
const useInventory = await Rebar.useApi().getAsync('inventory-api');
const hungerapi = await Rebar.useApi().getAsync('hunger-api');
const currencyapi = await Rebar.useApi().getAsync('currency-api');
const Keybinder = Rebar.useKeybinder()

messenger.commands.register({
    name: '/tpwp',
    desc: '- teleport to a given waypoint',
    callback: async (player: alt.Player) => {
        const pos = await Rebar.player.useWaypoint(player).get();
        if (!pos) {
            return;
        }

        player.pos = pos;
    },
});

messenger.commands.register({
    name: '/car',
    desc: '整辆车开开 [carname]',
    callback: async (player: alt.Player, carname: string) => {
        const newcar = new alt.Vehicle(carname, player.pos.x, player.pos.y, player.pos.z, 0, 0, 0);
        if (!newcar) {
            return;
        }
        player.setIntoVehicle(newcar, 1);
    },
});


messenger.commands.register({
    name: '/seatbelt',
    desc: 'Toggle your seatbelt on or off.',
    callback: async (player: alt.Player) => {
        if (!player.vehicle) return;

        alt.emitClient(player, 'SEATBELT');
    },
});


Rebar.messenger.useMessenger().commands.register({
    name: '/clearinventory',
    desc: '清空你的背包',
    callback: async (player: alt.Player) => {
        useInventory.updateInventory([], { player: player });
    },
});



Rebar.messenger.useMessenger().commands.register({
    name: '/set',
    desc: '设置你的任意值 [type] [value]',
    callback: async (player: alt.Player, type: string, value: string) => {
        const value1 = Number(value);
        if (type === 'food') {
            hungerapi.set(player, 'food', value1);
        }
        if (type === 'water') {
            hungerapi.set(player, 'water', value1);
        }
        if (type === 'shit') {
            hungerapi.set(player, 'shit', value1);
        }
        if (type === 'health') {
            player.health = value1;
        }
    },
});



Rebar.messenger.useMessenger().commands.register({
    name: '/testbank',
    desc: '测试一下金额',
    callback: async (player: alt.Player) => {
        currencyapi.add({ player }, 'bank', 1000);
        currencyapi.add({ player }, 'cash', 1000);
        currencyapi.add({ player }, 'points', 1000);
    },
});


alt.on('playerLeftVehicle', (player: alt.Player) => {
    alt.emitClient(player,'SEATBELT');
});


