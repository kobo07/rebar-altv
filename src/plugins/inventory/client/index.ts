import * as alt from 'alt-client';
import { useRebarClient } from '../../../main/client/index.js';


const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();


alt.on('keydown', (key) => {
    if (key == 73) {// I的键码： 73
        if(!webview.isAnyPageOpen){
            webview.show('inventory', 'page');
        }
    }
})


