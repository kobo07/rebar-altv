import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import * as native from 'natives';
import * as alt from 'alt-client';
import { getDirectionFromRotation } from '@Client/utility/math/index.js';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();



function setSeatbelt() {
    let value = !alt.Player.local.getMeta('SEATBELT');

    if (!alt.Player.local.vehicle) {
        value = false;
    }

    if (alt.Player.local.vehicle) {
        value
            ? native.setVehicleDoorsLocked(alt.Player.local.vehicle, 4)
            : native.setVehicleDoorsLocked(alt.Player.local.vehicle, 0);
    }

    alt.Player.local.setMeta('SEATBELT', value);
    native.setPedConfigFlag(alt.Player.local.scriptID, 32, value);

    useWebview().emit('SEATBELT', value);
}
alt.onServer('SEATBELT', setSeatbelt);






/*

let noclip = false;
let noclipSpeed = 1;

alt.on('keydown', (key) => {
    if (key === 117) { // F6 key
        noclip = !noclip;
        toggleNoClip(noclip);
    }
});

function toggleNoClip(enable: boolean) {
    const player = alt.Player.local;

    if (enable) {
        native.freezeEntityPosition(player.scriptID, true);
        native.setEntityVisible(player.scriptID, false, false);
        alt.log('NoClip enabled');
    } else {
        native.freezeEntityPosition(player.scriptID, false);
        native.setEntityVisible(player.scriptID, true, false);
        alt.log('NoClip disabled');
    }
}

alt.everyTick(() => {
    if (!noclip) return;

    const player = alt.Player.local;
    const playerPos = native.getEntityCoords(player.scriptID, true);

    const camRot = native.getGameplayCamRot(2);
    const camForward = rotationToDirection(camRot);

    const camRight = {
        x: camForward.y,
        y: -camForward.x,
        z: 0
    };

    let moveVector = { x: 0, y: 0, z: 0 };

    if (alt.isKeyDown(87)) { // W key
        moveVector.x += camForward.x;
        moveVector.y += camForward.y;
    }

    if (alt.isKeyDown(83)) { // S key
        moveVector.x -= camForward.x;
        moveVector.y -= camForward.y;
    }

    if (alt.isKeyDown(65)) { // A key
        moveVector.x -= camRight.x;
        moveVector.y -= camRight.y;
    }

    if (alt.isKeyDown(68)) { // D key
        moveVector.x += camRight.x;
        moveVector.y += camRight.y;
    }

    if (alt.isKeyDown(32)) { // Space key
        moveVector.z += 1;
    }

    if (alt.isKeyDown(16)) { // Shift key
        moveVector.z -= 1;
    }

    const length = Math.sqrt(moveVector.x ** 2 + moveVector.y ** 2 + moveVector.z ** 2);
    if (length !== 0) {
        moveVector.x /= length;
        moveVector.y /= length;
        moveVector.z /= length;
    }

    const newPosX = playerPos.x + moveVector.x * noclipSpeed;
    const newPosY = playerPos.y + moveVector.y * noclipSpeed;
    const newPosZ = playerPos.z + moveVector.z * noclipSpeed;

    native.setEntityCoordsNoOffset(player.scriptID, newPosX, newPosY, newPosZ, false, false, false);
});

function rotationToDirection(rotation: { x: number; y: number; z: number }) {
    const z = rotation.z * (Math.PI / 180.0);
    const x = rotation.x * (Math.PI / 180.0);
    const num = Math.abs(Math.cos(x));

    return {
        x: -Math.sin(z) * num,
        y: Math.cos(z) * num,
        z: Math.sin(x)
    };
}



*/






let camera: number | null = null;
let isCameraActive = false;
let cameraRotation = { x: 0, y: 0, z: 0 };
let lastCursorPos = { x: 0, y: 0 };
let tick

function createCamera(x: number, y: number, z: number) {
    if (camera !== null) {
        native.destroyCam(camera, true);
        camera = null;
    }

    camera = native.createCam('DEFAULT_SCRIPTED_CAMERA', true);
    native.setCamCoord(camera, x, y, z);
    cameraRotation = { x: 0, y: 0, z: 0 }; // 设置初始旋转角度为固定值
    native.setCamRot(camera, cameraRotation.x, cameraRotation.y, cameraRotation.z, 2);
    native.setCamActive(camera, true);
    native.renderScriptCams(true, true, 1000, true, false, 0);
    isCameraActive = true;
    lastCursorPos = alt.getCursorPos();

    // 确保高清渲染
    native.setFocusPosAndVel(x, y, z, 0.0, 0.0, 0.0);


    //  native.clearFocus();
}

function destroyCamera() {
    if (camera !== null) {
        native.destroyCam(camera, true);
        native.renderScriptCams(false, true, 1000, true, false, 0);
        camera = null;
        isCameraActive = false;
        native.clearFocus(); // 清除聚焦区域
    }
}

function toggleCamera(x: number, y: number, z: number) {
    if (isCameraActive) {
        destroyCamera();
        clearFilter();
        Rebar.player.useControls().setControls(true); // 重新启用玩家控制
        if(tick){
            alt.clearEveryTick(tick);
            tick = null;
        }

       native.doScreenFadeOut(0);
        setTimeout(() => {
            native.doScreenFadeIn(1000)
        }, 1000);
    } else {
        createCamera(x, y, z);
        applyFilter('CAMERA_BW');
        Rebar.player.useControls().setControls(false); // 禁用玩家控制
        checkMouseMovement();
        native.doScreenFadeOut(0);
        setTimeout(() => {
            native.doScreenFadeIn(1000)
        }, 1000);
    }
}

function updateCameraRotation(deltaX: number, deltaY: number) {
    if (!camera) return;

   cameraRotation.z -= deltaX * 0.1; // 调整灵敏度并反向X轴移动
   cameraRotation.x = cameraRotation.x - deltaY * 0.1, -90 // 限制上下视角范围

    native.setCamRot(camera, cameraRotation.x, cameraRotation.y, cameraRotation.z, 2);
}

// 鼠标移动事件处理函数
function checkMouseMovement() {
    tick = alt.everyTick(() => {
    if (isCameraActive) {
        const cursorPos = alt.getCursorPos();
        const deltaX = cursorPos.x - lastCursorPos.x;
        const deltaY = cursorPos.y - lastCursorPos.y;
        lastCursorPos = cursorPos;

        updateCameraRotation(deltaX, deltaY);
    }

})
}

// 添加滤镜效果
function applyFilter(filterName: string) {
    native.setTimecycleModifier(filterName);
}

// 移除滤镜效果
function clearFilter() {
    native.clearTimecycleModifier();
}

// 绑定键盘按键来切换摄像头和应用滤镜
alt.on('keydown', (key) => {
    if (key === 0x4C) { // 'L'键
        const cameraPosition = { x: -761.0, y: -1133.0, z: 12.0 }; // 示例位置
        toggleCamera(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    }
});



// 确保在资源停止时销毁摄像头和清除滤镜
alt.on('resourceStop', () => {
    destroyCamera();
    clearFilter();
});
