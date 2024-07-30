import * as alt from 'alt-client';
import { useRebarClient } from '../../../main/client/index.js';


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


            if(webview.isAnyPageOpen() && webview.isSpecificPageOpen('inven1')){
            webview.hide('inven1');
            Rebar.player.useControls().setControls(true);
            return
            }

            if(webview.isAnyPageOpen() && !webview.isSpecificPageOpen('inven1')){
            return
            }

            webview.show('inven1', 'page');
            Rebar.player.useControls().setControls(false);
 
    }
})


