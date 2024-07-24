import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { CollectionNames } from '@Server/document/shared.js';
import { Character } from '@Shared/types/index.js';

const API_NAME = 'hunger-api';
const Rebar = useRebar();
const event = Rebar.events.useEvents();
const api = Rebar.useApi();

const charSelectApi = api.get('character-creator-api');

charSelectApi.onSkipCreate(givecharacterdefaultdata);

declare module '@Shared/types/index.js' {
    interface Character {
      hunger?: number;
      thirst?: number;
      shit?: number;
    }
  }

  
function givecharacterdefaultdata(player: alt.Player) {
    const doc = Rebar.document.character.useCharacter(player)
    if (!doc) {
        return;
    }
    doc.set('hunger', 100);
    doc.set('thirst', 100);
    doc.set('shit',0);
}

