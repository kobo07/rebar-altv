import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import * as alt from 'alt-client';
import native from 'natives'

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();

const HUNGER_INTERVAL = 1000 * 60 // 10分钟
const FOOD_DECREMENT = 7;
const WATER_DECREMENT = 7;
const SHIT_INCREMENT = 3.5;



alt.onceServer('hunger:start', () => {
    starthungerinterval();
});

function starthungerinterval() {
    alt.setInterval(async () => {
        let food = alt.Player.local.getStreamSyncedMeta('food') as number;
        let water = alt.Player.local.getStreamSyncedMeta('water') as number;
        let shit = alt.Player.local.getStreamSyncedMeta('shit') as number;

        if (food > FOOD_DECREMENT) {
            food -= FOOD_DECREMENT;
        } else {
            food = 0;
            alt.emitServer('hunger:hurt', 'food');
        }

        if (water > WATER_DECREMENT) {
            water -= WATER_DECREMENT;
        } else {
            water = 0;
            alt.emitServer('hunger:hurt', 'water');
        }

        if (shit < 100 - SHIT_INCREMENT && food > FOOD_DECREMENT) {
            shit += SHIT_INCREMENT;
        }
        if (shit > 100 - SHIT_INCREMENT) {
            alt.emitServer('hunger:shit');
        }

        alt.emitServer('hunger:update', food, water, shit);

    }, HUNGER_INTERVAL);
}




alt.setInterval(() => {
    const food = alt.Player.local.getStreamSyncedMeta('food') as number;
    const water = alt.Player.local.getStreamSyncedMeta('water') as number;
    const health = alt.Player.local.health

    if (food < 21 || water < 21  || health < 119) {
        native.disableControlAction(0, 21, true); //Disable Sprint
    }
    else{
        native.disableControlAction(0, 21, false); //Enable Sprint
    }

}, 50)
