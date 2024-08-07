import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import * as alt from 'alt-client';
import native from 'natives'
import { PlayerStatsEx } from '../webview/stats.js';
import { getDirectionFromRotation } from '@Client/utility/math/index.js';
import { drawText2D } from '@Client/screen/textlabel.js';


const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();

useWebview().show('hud', 'overlay');




const view = useWebview();

function update() {

    const stats: PlayerStatsEx = {
        id: alt.Player.local.getStreamSyncedMeta('id') as number,
        food: alt.Player.local.getStreamSyncedMeta('food') as number,
        water: alt.Player.local.getStreamSyncedMeta('water') as number,
        shit: alt.Player.local.getStreamSyncedMeta('shit') as number,
        isSprint:native.isPedSprinting(alt.Player.local.scriptID),
        isRunning: native.isPedRunning(alt.Player.local.scriptID),
        isHurt: alt.Player.local.health <= 140,
        isdead: alt.Player.local.isDead
    };

    view.emit('sendstatex', stats);
}

alt.setInterval(update, 50);
