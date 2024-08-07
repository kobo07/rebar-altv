import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import * as native from 'natives';
import * as alt from 'alt-client';
import './enterveh.js'
import { getDirectionFromRotation } from '@Client/utility/math/index.js';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();

/*
alt.onServer('MessureMileage', (oldMileage: number) => {
    let totalDistance = oldMileage;
    let lastTickTime = Date.now();
    let time = 0;
    let lastVehicle: alt.Vehicle | null = null;
    let intervalId: number | null = null;

    const startInterval = () => {
        if (intervalId === null) {
            intervalId = alt.setInterval(calculateDistance, 50);
        }
    };

    const stopInterval = () => {
        if (intervalId !== null) {
            alt.clearInterval(intervalId);
            intervalId = null;
        }
    };

    const calculateDistance = () => {
        const vehicle = alt.Player.local.vehicle;

        if (!vehicle && lastVehicle && time > 0) {
            alt.emitServer('SetMileage', totalDistance, lastVehicle);
            stopInterval();
            return;
        }

        if (!vehicle) return;

        if (!vehicle.engineOn && time > 0) {
            alt.emitServer('SetMileage', totalDistance, vehicle);
            stopInterval();
            return;
        }

        if (!vehicle.engineOn) return;

        const currentTime = Date.now();
        const timeDelta = (currentTime - lastTickTime) / 1000; // convert ms to seconds
        lastTickTime = currentTime;

        const velocity = native.getEntityVelocity(vehicle.scriptID);
        const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);

        // Calculate distance using speed and time delta
        const distance = speed * timeDelta;
        totalDistance += distance;

        time++;

        lastVehicle = vehicle;

        if (time >= 100) {
            time = 0;
            alt.emitServer('SetMileage', totalDistance, vehicle);
        }
    };

    startInterval();

    // Ensure mileage is set when the resource stops
    alt.on('resourceStop', () => {
        if (lastVehicle) {
            alt.emitServer('SetMileage', totalDistance, lastVehicle);
        }
        stopInterval();
    });
});
*/











// 记录载具内部灯的状态
let isInteriorLightOn = false;

function toggleInteriorLights() {
    const vehicle = alt.Player.local.vehicle;
    if (!vehicle) return;

    // 切换灯光状态
    isInteriorLightOn = !isInteriorLightOn;
    native.setVehicleInteriorlight(vehicle.scriptID, isInteriorLightOn);
}

// 绑定键盘按键来切换灯光
alt.on('keydown', (key) => {
    if (key === 0x4C) { // 'L'键
        toggleInteriorLights();
    }
});




