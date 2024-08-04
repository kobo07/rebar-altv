import * as alt from 'alt-client';
import { useRebarClient } from '../../../main/client/index.js';
import native from 'natives'
import { BagItem } from '../server/index.js';
import { useWebview } from '@Client/webview/index.js';



const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();



alt.on('keydown', (key) => {
    if (key == 73) {// I的键码： 73
        if (alt.isConsoleOpen()) {
            return
        }
        if (messenger.isChatFocused()) {
            return
        }
        if (webview.isAnyPageOpen() && webview.isSpecificPageOpen('inven1')) {
            webview.hide('inven1');
            Rebar.player.useControls().setControls(true);
            alt.emitServer('inventory:close');
            return
        }
        if (webview.isAnyPageOpen() && !webview.isSpecificPageOpen('inven1')) {
            return
        }
        webview.show('inven1', 'page');
        Rebar.player.useControls().setControls(false);
        alt.emitServer('inventory:open');
    }
})

/*
webview.show('inven1', 'page');
webview.hide('inven1');


let inv: BagItem[] = [];

alt.onServer('inventory:sync', (inventory: BagItem[]) => {
    inv = inventory
})

const view = useWebview();
function update() {
    const stats: BagItem[] = inv;
    view.emit('sendinv', stats);
}

alt.setInterval(update, 50);
*/
