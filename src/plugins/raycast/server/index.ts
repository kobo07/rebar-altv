import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { useApi } from '@Server/api/index.js';
import { Character } from '@Shared/types/character.js';
import { useWebview } from '@Server/player/webview.js';

const api = useApi();
const Rebar = useRebar();
const serverConfig = Rebar.useServerConfig();
const Keybinder = Rebar.systems.useKeybinder();



Keybinder.on(80, async (player) => {// p
    const rPlayer = Rebar.usePlayer(player);
// Commonly used raycast functions
/*const someVeh = await rPlayer.raycast.getFocusedEntity('vehicle');
const somePlayer = await rPlayer.raycast.getFocusedEntity('player');
const someAltvObject = await rPlayer.raycast.getFocusedEntity('object', true); 


const someWorldObject = await rPlayer.raycast.getFocusedObject(false);
console.log(someWorldObject.model, someWorldObject.pos, someWorldObject.scriptId, someWorldObject.entityPos);*/

// Position where the player is looking, intersects with everything
const somePos = await rPlayer.raycast.getFocusedPosition(true); // Passing `true` draws a debug line in-game
console.log(somePos.x, somePos.y, somePos.z);


Rebar.controllers.useObjectGlobal({ model: alt.hash('prop_big_shit_02'), pos:somePos });
})

