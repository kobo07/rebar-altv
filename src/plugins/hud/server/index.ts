import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { useApi } from '@Server/api/index.js';
import { Character } from '@Shared/types/character.js';
import { useWebview } from '@Server/player/webview.js';

const api = useApi();
const Rebar = useRebar();

Rebar.events.useEvents().on('character-bound',(player:alt.Player,documen:Character) => {
    useWebview(player).show('hud', 'overlay');
})

