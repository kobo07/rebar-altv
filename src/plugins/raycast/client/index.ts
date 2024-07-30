import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import { getDirectionFromRotation } from '@Client/utility/math/index.js';
import { drawText2D } from '@Client/screen/textlabel.js';
import * as native from 'natives';
import * as alt from 'alt-client';


const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();










interface Vector3 {
    x: number;
    y: number;
    z: number;
}

// 工具函数
function mulNumber(vector1: Vector3, value: number): Vector3 {
    return {
        x: vector1.x * value,
        y: vector1.y * value,
        z: vector1.z * value
    };
}

function addVector3(vector1: Vector3, vector2: Vector3): Vector3 {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y,
        z: vector1.z + vector2.z
    };
}

function subVector3(vector1: Vector3, vector2: Vector3): Vector3 {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y,
        z: vector1.z - vector2.z
    };
}

function rotationToDirection(rotation: Vector3): Vector3 {
    let z = degToRad(rotation.z);
    let x = degToRad(rotation.x);
    let num = Math.abs(Math.cos(x));

    let result: Vector3 = { x: 0, y: 0, z: 0 }; // 初始化 result 对象
    result.x = -Math.sin(z) * num;
    result.y = Math.cos(z) * num;
    result.z = Math.sin(x);
    return result;
}

function w2s(position: Vector3): Vector3 | undefined {
    let result = native.getScreenCoordFromWorldCoord(position.x, position.y, position.z, undefined, undefined);

    if (!result[0]) {
        return undefined;
    }

    let newPos: Vector3 = { x: 0, y: 0, z: 0 }; // 初始化 newPos 对象
    newPos.x = (result[1] - 0.5) * 2;
    newPos.y = (result[2] - 0.5) * 2;
    newPos.z = 0;
    return newPos;
}

function processCoordinates(x: number, y: number): { x: number, y: number } {
    const [_, width, height] = native.getActualScreenResolution(0, 0);

    const screenX = width;
    const screenY = height;

    let relativeX = 1 - (x / screenX) * 1.0 * 2;
  
    let relativeY = 1 - (y / screenY) * 1.0 * 2;
 

    if (relativeX > 0.0) {
        relativeX = -relativeX;
    } else {
        relativeX = Math.abs(relativeX);
    }

    if (relativeY > 0.0) {
        relativeY = -relativeY;
    } else {
        relativeY = Math.abs(relativeY);
    }

    return { x: relativeX, y: relativeY };
}

function s2w(camPos: Vector3, relX: number, relY: number): Vector3 {
    const camRot = native.getGameplayCamRot(0) as Vector3;
    const camForward = rotationToDirection(camRot);
    const rotUp = addVector3(camRot, { x: 10, y: 0, z: 0 });
    const rotDown = addVector3(camRot, { x: -10, y: 0, z: 0 });
    const rotLeft = addVector3(camRot, { x: 0, y: 0, z: -10 });
    const rotRight = addVector3(camRot, { x: 0, y: 0, z: 10 });

    const camRight = subVector3(rotationToDirection(rotRight), rotationToDirection(rotLeft));
    const camUp = subVector3(rotationToDirection(rotUp), rotationToDirection(rotDown));

    const rollRad = -degToRad(camRot.y);

    const camRightRoll = subVector3(mulNumber(camRight, Math.cos(rollRad)), mulNumber(camUp, Math.sin(rollRad)));
    const camUpRoll = addVector3(mulNumber(camRight, Math.sin(rollRad)), mulNumber(camUp, Math.cos(rollRad)));

    const point3D = addVector3(addVector3(addVector3(camPos, mulNumber(camForward, 10.0)), camRightRoll), camUpRoll);

    const point2D = w2s(point3D);


    if (point2D === undefined) {
        return addVector3(camPos, mulNumber(camForward, 10.0));
    }

    const point3DZero = addVector3(camPos, mulNumber(camForward, 10.0));
    const point2DZero = w2s(point3DZero);
  

    if (point2DZero === undefined) {
        return addVector3(camPos, mulNumber(camForward, 10.0));
    }

    const eps = 0.001;

    if (Math.abs(point2D.x - point2DZero.x) < eps || Math.abs(point2D.y - point2DZero.y) < eps) {
        return addVector3(camPos, mulNumber(camForward, 10.0));
    }

    const scaleX = (relX - point2DZero.x) / (point2D.x - point2DZero.x);
    const scaleY = (relY - point2DZero.y) / (point2D.y - point2DZero.y);
    const point3Dret = addVector3(
        addVector3(addVector3(camPos, mulNumber(camForward, 10.0)), mulNumber(camRightRoll, scaleX)),
        mulNumber(camUpRoll, scaleY)
    );


    return point3Dret;
}

function degToRad(deg: number): number {
    return (deg * Math.PI) / 180.0;
}

// 获取鼠标位置并转换为世界坐标
function screenToWorld(flags: number, ignore: number) {
    const x = alt.getCursorPos().x;
    const y = alt.getCursorPos().y;

    const absoluteX = x;
    const absoluteY = y;

    const camPos = native.getGameplayCamCoord() as Vector3;

    const processedCoords = processCoordinates(absoluteX, absoluteY);

    const target = s2w(camPos, processedCoords.x, processedCoords.y);


    const dir = subVector3(target, camPos);
    const from = addVector3(camPos, mulNumber(dir, 0.05));
    const to = addVector3(camPos, mulNumber(dir, 300));


    const ray = native.startExpensiveSynchronousShapeTestLosProbe(from.x, from.y, from.z, to.x, to.y, to.z, flags, ignore, 0);
    const result = native.getShapeTestResult(ray);

    return result;
}









let everyTickStart = false;
let tick
let pos 
let entity

// 键盘监听事件，按下O键时获取鼠标位置并转换为世界坐标
alt.on('keydown', (key) => {
    if (key === 79) { // O 键

        if (alt.isConsoleOpen()) {
            return
        }
        if (messenger.isChatFocused()) {
            return
        }

        if(webview.isAnyPageOpen()){
            return
        }

        
        if(everyTickStart === false){
        webview.showCursor(true);
        alt.setCursorPos({x: 0.5, y: 0.5},true);
        Rebar.player.useControls().setControls(false);
        everyTickStart = true;
        tick = alt.everyTick(() => {
        const result = screenToWorld(1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256, -1);
        if (result[0]) {
            const [hit, success, hitPosition, coords, entity1] = result;
            pos = hitPosition
            entity = entity1
                drawText2D(`World Coordinates: ${hitPosition.x}, ${hitPosition.y}, ${hitPosition.z} ` , { x: 0.5, y: 0.5 }, 0.5, new alt.RGBA(255, 255,100));
            
        } 
    })
        }
        else
        {
            everyTickStart = false;
            alt.clearEveryTick(tick);
            webview.showCursor(false);
            Rebar.player.useControls().setControls(true);
            pos = undefined
            entity = undefined
        }
    }
}
)




alt.on('keydown', (key) => {
    if (key ===88 ) { // x
        native.createObject(alt.hash('prop_big_shit_02'), pos.x, pos.y, pos.z, true, true, true)
        native.drawLine(pos.x, pos.y, pos.z, alt.Player.local.pos.x, alt.Player.local.pos.y,alt.Player.local.pos.z, 255, 255, 255, 255);
        
    }
})