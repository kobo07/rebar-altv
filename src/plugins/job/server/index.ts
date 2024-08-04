import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { Character } from '@Shared/types/character.js';
import { useWebview } from '@Server/player/webview.js';


const Rebar = useRebar();
const serverConfig = Rebar.useServerConfig();
const Keybinder = Rebar.systems.useKeybinder();









Rebar.messenger.useMessenger().commands.register({
    name: '/pizza',
    desc: '蟹堡王的披萨，是第一旺的披萨！',
    callback: async (player: alt.Player, type: string, value: string) => {

        Rebar.player.useWebview(player).hide('hud')

        const object = Rebar.controllers.useObjectGlobal({
            model: alt.hash('prop_pizza_box_01'),
            pos: player.pos,
        });
        
        const prop = object.getObject();
        const result = await player.emitRpc('startAnimation', prop);
        
        if (!result) {
            object.destroy();
            return;
        }
        
        object.destroy();

        Rebar.player.useWebview(player).show('hud','overlay')
     
    },
});




