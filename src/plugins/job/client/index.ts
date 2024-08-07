import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import * as native from 'natives';
import * as alt from 'alt-client';
import { getDirectionFromRotation } from '@Client/utility/math/index.js';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();






const dict = 'anim@scripted@freemode@ig9_pizza@male@';
alt.onRpc('startAnimation', async (prop: alt.Object) => {

    await alt.Utils.requestAnimDict(dict);
    await alt.Utils.requestModel('prop_pizza_box_01');
    await alt.Utils.waitFor(() => prop.isSpawned);
    await alt.Utils.waitFor(() => prop.valid);

    if (!prop.valid) {
        return false;
    }

    const playerPed = alt.Player.local.scriptID;
    const playerPos = alt.Player.local.pos;
    const playerHead = native.getEntityHeading(playerPed);

    const scene = native.networkCreateSynchronisedScene(
        playerPos.x,
        playerPos.y,
        playerPos.z,
        0.0,
        0.0,
        playerHead,
        2,
        false,
        false,
        -1,
        0,
        1.0,
    );

    native.networkAddPedToSynchronisedScene(
        playerPed,
        scene,
        dict,
        'action_03_player',
        1.5,
        -4.0,
        1,
        16,
        1148846080,
        0,
    );

    native.networkAddEntityToSynchronisedScene(prop, scene, dict, 'action_03_pizza', 1.0, 1.0, 1);

    const cam = native.createCam('DEFAULT_ANIMATED_CAMERA', true);
    native.playCamAnim(
        cam,
        'action_03_cam',
        dict,
        playerPos.x,
        playerPos.y,
        playerPos.z,
        0.0,
        0.0,
        playerHead,
        false,
        2,
    );

    native.renderScriptCams(true, false, 0, true, false, 0);
    native.networkStartSynchronisedScene(scene);
    native.takeOwnershipOfSynchronizedScene(scene);

    await alt.Utils.wait(native.getAnimDuration(dict, 'action_03_player') * 1000);

    native.setCamActive(cam, false);
    native.renderScriptCams(false, true, 1000, true, false, 0);
    native.networkStopSynchronisedScene(scene);
    native.clearPedTasksImmediately(playerPed);
    native.destroyCam(cam, false);

    return true;
});








//native.beginTextCommandPrint('STRING');
//native.addTextComponentSubstringPlayerName('Hello, world!');
//native.endTextCommandPrint(100000, true);