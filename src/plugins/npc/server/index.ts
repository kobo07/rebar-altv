import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';


const Rebar = useRebar();
const messenger = Rebar.messenger.useMessenger();
const useInventory = await Rebar.useApi().getAsync('inventory-api');
const hungerapi = await Rebar.useApi().getAsync('hunger-api');
const currencyapi = await Rebar.useApi().getAsync('currency-api');
const Keybinder = Rebar.useKeybinder()



function CreatePed(player: alt.Player, type: string) {
    const ped = new alt.Ped('s_m_y_swat_01', player.pos, player.rot);
    if (!ped) {
        return;
    }

    if (type === 'Driver') {
        if (!player.vehicle) {
            const newvehicle = new alt.Vehicle('t20', ped.pos.x, ped.pos.y, ped.pos.z, 0, 0, 0);
            player.setIntoVehicle(newvehicle, 2);
            alt.emitClient(player, 'CreatePed:done', ped, 'Driver', newvehicle);
        }
        else {
            player.setIntoVehicle(player.vehicle, 2);
            alt.emitClient(player, 'CreatePed:done', ped, 'Driver', player.vehicle);
        }
    }

    if (type === 'Passenger') {
        alt.emitClient(player, 'CreatePed:done', ped, 'Passenger');
    }

    if (type === 'Attacker') {
        alt.emitClient(player, 'CreatePed:done', ped, 'Attacker');
    }
}


alt.onClient('DriveNpc:Done', (player: alt.Player, vehicle: alt.Vehicle, ped: alt.Ped,) => {
    vehicle.engineOn = false
    ped.destroy();
});




messenger.commands.register({
    name: '/ped',
    desc: '召唤一个ped [type]',
    callback: async (player: alt.Player, type: string) => {
        if (type === 'attacker') {
            CreatePed(player, 'Attacker');
        }
        if (type === 'driver') {
            CreatePed(player, 'Driver');
        }
        if (type === 'passenger') {
            CreatePed(player, 'Passenger');
        }
    },
});
