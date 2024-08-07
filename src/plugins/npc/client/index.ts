import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import * as native from 'natives';
import * as alt from 'alt-client';
import { getDirectionFromRotation } from '@Client/utility/math/index.js';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();


type PedType = 'Passenger' | 'Driver' | 'Attacker'




alt.onServer('CreatePed:done', async (ped: alt.Ped, type: PedType, vehicle?: alt.Vehicle) => {
    await alt.Utils.wait(1000); // wait for brain to be ready to accept tasks
    if (type === 'Passenger') {
        CreatePassengerNpc(ped);
    }
    if (type === 'Attacker') {
        CreateAttackerNpc(ped);
    }
    if (type === 'Driver') {
        CreateDriverNpc(ped, vehicle);
    }
}
)


export function CreatePassengerNpc(ped: alt.Ped) {
    const seat = (() => {
        for (let i = -1; i < native.getVehicleMaxNumberOfPassengers(alt.Player.local.vehicle); ++i) {
            if (native.isVehicleSeatFree(alt.Player.local.vehicle, i, true)) {
                return i;
            }
        }
        return null;
    })();
    if (seat !== null) {
        native.taskEnterVehicle(ped, alt.Player.local.vehicle, 5000, seat, 2, 0, null, 0);
    }
}



export function CreateAttackerNpc(ped: alt.Ped) {
    native.giveWeaponToPed(ped, alt.hash('WEAPON_PISTOL'), 100, false, true);
    native.taskShootAtEntity(ped, alt.Player.local.scriptID, 1000000, 1);
}



export function CreateDriverNpc(ped: alt.Ped, vehicle: alt.Vehicle) {
    native.taskEnterVehicle(ped, vehicle, 5000, -1, 2, 10, null, 0);
    const waypoint = native.getFirstBlipInfoId(8);
    if (!waypoint) {
        return;
    }
    const coords = native.getBlipInfoIdCoord(waypoint);
    native.setDriverAbility(ped,1.0);
   native.taskVehicleDriveToCoord(ped, vehicle.scriptID, coords.x, coords.y, coords.z, 150, 0, vehicle.model, 8388614, 10, 0);
    //native.taskVehicleDriveToCoordLongrange(ped, vehicle.scriptID, coords.x, coords.y, coords.z, 150, 8388614, 5);
   const tick =  alt.everyTick(async () => {
        const pos = ped.pos;
        if(pos.distanceTo(coords) < 10) {
            native.taskLeaveAnyVehicle(ped, 0, 0);
            setTimeout(() => {
                alt.emitServer('DriveNpc:Done',vehicle,ped)
            }, 5000);
            alt.clearEveryTick(tick);
        }

        if(!alt.Player.local.vehicle){
            native.taskLeaveAnyVehicle(ped, 0, 0);
            setTimeout(() => {
                alt.emitServer('DriveNpc:Done',vehicle,ped)
            }, 5000);
            alt.clearEveryTick(tick);
        }
    },
);
}


