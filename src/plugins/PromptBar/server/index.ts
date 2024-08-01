import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { Character } from '@Shared/types/character.js';
import { useWebview } from '@Server/player/webview.js';

const api = useApi();
const Rebar = useRebar();
const serverConfig = Rebar.useServerConfig();
const Keybinder = Rebar.systems.useKeybinder();



declare global {
    export interface ServerPlugin {
        ['promptbar-api']: ReturnType<typeof useApi>;
    }
}


function useApi() {
    function showPromptBar(player: alt.Player, text: string) {
        const webview = Rebar.player.useWebview(player);
        webview.emit('showpromptbar', text);
    }

    function hidePromptBar(player: alt.Player) {
        const webview = Rebar.player.useWebview(player);
        webview.emit('hidepromptbar');
    }

    return {
        showPromptBar,
        hidePromptBar
    }
}


Rebar.useApi().register('promptbar-api', useApi());