import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import * as alt from 'alt-client';
import native from 'natives'
import { PlayerStatsEx } from '../webview/stats.js';


const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();

useWebview().show('hud', 'overlay');







const view = useWebview();

function update() {

    const stats: PlayerStatsEx = {
        food: alt.Player.local.getStreamSyncedMeta('food') as number,
        water: alt.Player.local.getStreamSyncedMeta('water') as number,
        shit: alt.Player.local.getStreamSyncedMeta('shit') as number,
    };

    view.emit('sendstatex', stats);
}

alt.setInterval(update, 50);
