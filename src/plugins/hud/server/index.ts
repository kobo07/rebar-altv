import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { useApi } from '@Server/api/index.js';
import { Character } from '@Shared/types/character.js';
import { useWebview } from '@Server/player/webview.js';

const api = useApi();
const Rebar = useRebar();
const serverConfig = Rebar.useServerConfig();
const Keybinder = Rebar.systems.useKeybinder();
const SyncedBinder = Rebar.systems.useStreamSyncedBinder();

declare module 'alt-shared' {
    export interface ICustomEntityStreamSyncedMeta {
        id?: number;
    }
}


SyncedBinder.syncCharacterKey('id');

serverConfig.set('hideHealthArmour',true)
serverConfig.set('disablePistolWhip', true);
serverConfig.set('disableVehicleEngineAutoStart', true);
serverConfig.set('disableVehicleEngineAutoStop', true);
serverConfig.set('disableVehicleSeatSwap', true);
//serverConfig.set('disableWeaponRadial', true);

