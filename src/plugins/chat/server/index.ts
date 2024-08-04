import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import * as Utility from '@Shared/utility/index.js';
import './api.js';

import { ChatConfig } from '../shared/config.js';
import { ChatEvents } from '../shared/events.js';
import { Character } from '@Shared/types/character.js';

const Rebar = useRebar();
const messenger = Rebar.messenger.useMessenger();

function handlePlayerMessage(player: alt.Player, msg: string) {
    for (let target of alt.Player.all) {
        if (!ChatConfig.globalChat && Utility.vector.distance2d(player.pos, target.pos) > ChatConfig.chatDistance) {
            continue;
        }

        if (!target.valid) {
            continue;
        }

        messenger.message.send(target, { type: 'player', content: msg, author: player.name });
    }
}

async function getCommands(player: alt.Player) {
    const commands = await messenger.commands.getCommands(player);
    Rebar.player.useWebview(player).emit(ChatEvents.toWebview.commands, commands);
}

alt.onClient(ChatEvents.toWebview.commands, getCommands);
messenger.message.on(handlePlayerMessage);




const api = Rebar.useApi();


/*alt.on('playerConnect', async (player) => {
   const chat = await api.getAsync('chat-api');
    chat.show(player);


    const isChatting = chat.isChatting(player);


    chat.onChatStatusChange((player, isCurrentlyChatting) => {});
});*/



Rebar.events.useEvents().on('character-bound', async (player: alt.Player, document: Character) => {
    const chat = await api.getAsync('chat-api');
    chat.show(player);

    // Check if they're chatting server-side
    const isChatting = chat.isChatting(player);

    // Call back to check when a players chat status changes
    chat.onChatStatusChange((player, isCurrentlyChatting) => {});
});