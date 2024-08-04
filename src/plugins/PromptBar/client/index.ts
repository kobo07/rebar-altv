import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import { getDirectionFromRotation } from '@Client/utility/math/index.js';
import { drawText2D } from '@Client/screen/textlabel.js';
import * as native from 'natives';
import * as alt from 'alt-client';


const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();


webview.show('promptbar', 'overlay');

declare global {
    export interface ClientPlugin {
        ['promptbar-client-api']: ReturnType<typeof usePromptBarAPI>;
    }
}


export function usePromptBarAPI() {
    
        return {
            showPromptBar: (text: string) => {
                webview.emit('showpromptbar', text);
            },
            hidePromptBar: () => {
                webview.emit('hidepromptbar');
            },
        }
    }


Rebar.useClientApi().register('promptbar-client-api', {usePromptBarAPI})