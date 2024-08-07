import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { CollectionNames } from '@Server/document/shared.js';
import { Vehicle } from '@Shared/types/vehicle.js';


const Rebar = useRebar();
const messenger = Rebar.messenger.useMessenger();
const useInventory = await Rebar.useApi().getAsync('inventory-api');
const hungerapi = await Rebar.useApi().getAsync('hunger-api');
const currencyapi = await Rebar.useApi().getAsync('currency-api');
const db = Rebar.database.useDatabase();

declare module '@Shared/types/vehicle.js' {
    export interface Vehicle {
        donotspawn: boolean;
        garage?: string;
        priceinshop? : number;
        mileage :number;
        health :number;
    }
}

declare module 'alt-shared' {
    export interface ICustomEntityStreamSyncedMeta {
        mileage?: number;
        health?: number;
    }
}

const allvehicle = await db.getAll<{ _id: string } & Vehicle>(CollectionNames.Vehicles)

allvehicle.forEach(async (vehicle) => {
    if (vehicle.donotspawn) {
        return;
    }
    const newcar = new alt.Vehicle(vehicle.model, vehicle.pos.x, vehicle.pos.y, vehicle.pos.z, vehicle.rot.x, vehicle.rot.y, vehicle.rot.z);
    if (!newcar) {
        return;
    }
   
    const document = Rebar.document.vehicle.useVehicleBinder(newcar).bind(vehicle);
    
    newcar.setStreamSyncedMeta('mileage', vehicle.mileage)
    newcar.setStreamSyncedMeta('health', vehicle.health)
}
)






alt.on('playerEnteredVehicle', (player: alt.Player, vehicle: alt.Vehicle, seat: number) => {
    if(vehicle.driver === player){
        const oldmileage = vehicle.getStreamSyncedMeta('mileage') as number
        if(!oldmileage){
            vehicle.setStreamSyncedMeta('mileage', 0)
            alt.emitClient(player, 'MessureMileage', 0);
            return;
        }
        alt.emitClient(player, 'MessureMileage', oldmileage);
    }
})


alt.onClient('SetMileage', (player:alt.Player,mileage: number,vehicle:alt.Vehicle) => {
    const document = Rebar.document.vehicle.useVehicle(vehicle);
    document.set('mileage',mileage)
})

