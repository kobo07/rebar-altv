import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import { getDirectionFromRotation } from '@Client/utility/math/index.js';
import { drawText2D, drawText3D } from '@Client/screen/textlabel.js';
import * as native from 'natives';
import * as alt from 'alt-client';
import { BagItem } from '@Plugins/inventory/server/index.js';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();

// 用于存储选中的实体
let selectedEntity = null;

// 获取玩家与实体的距离
function getDistance(entity) {
    const playerPos = alt.Player.local.pos;
    const entityPos = native.getEntityCoords(entity.scriptID, true);
    return Math.sqrt(
        Math.pow(entityPos.x - playerPos.x, 2) +
        Math.pow(entityPos.y - playerPos.y, 2) +
        Math.pow(entityPos.z - playerPos.z, 2)
    );
}

// 更新选中的实体
function updateSelectedEntity() {
    const playerPos = alt.Player.local.pos;
    let nearestEntity = null;
    let nearestDistance = Infinity;

    // 获取所有车辆
    const vehicles = alt.Vehicle.all;
    vehicles.forEach(vehicle => {
        const distance = getDistance(vehicle);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestEntity = vehicle;
        }
    });

    // 获取所有玩家
    const players = alt.Player.all;
    players.forEach(player => {
        if (player.scriptID !== alt.Player.local.scriptID) {
            const distance = getDistance(player);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEntity = player;
            }
        }
    });

    // 获取所有物体
    const objects = alt.Object.all;
    objects.forEach(object => {
        const distance = getDistance(object);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestEntity = object;
        }
    });

    // 更新选中的实体
    if (nearestEntity !== selectedEntity) {
        resetEntityHighlight(selectedEntity);
        selectedEntity = nearestEntity;
        highlightEntity(selectedEntity);
    }
}

// 高亮选中的实体
function highlightEntity(entity) {
    if (!entity) return;
    const entityType = native.getEntityType(entity.scriptID);
    switch (entityType) {
        case 1: // 玩家
            native.setEntityAlpha(entity.scriptID, 150, false);
            break;
        case 2: // 车辆
            native.setVehicleLightMultiplier(entity.scriptID, 1.0);
            break;
        case 3: // 物体
            native.setEntityAlpha(entity.scriptID, 150, false);
            break;
    }
}

// 恢复实体的原始状态
function resetEntityHighlight(entity) {
    if (!entity) return;
    const entityType = native.getEntityType(entity.scriptID);
    switch (entityType) {
        case 1: // 玩家
            native.resetEntityAlpha(entity.scriptID);
            break;
        case 2: // 车辆
            native.setVehicleLightMultiplier(entity.scriptID, 0.0);
            break;
        case 3: // 物体
            native.resetEntityAlpha(entity.scriptID);
            break;
    }
}

// 每帧更新选中实体
alt.everyTick(() => {
    updateSelectedEntity();
});

// 处理按键事件
alt.on('keydown', (key) => {
    if (key == 88) { // X键
        if (alt.isConsoleOpen()) {
            return;
        }
        if (messenger.isChatFocused()) {
            return;
        }

        if (webview.isAnyPageOpen() && webview.isSpecificPageOpen('wheelmenu')) {
            webview.hide('wheelmenu');
            Rebar.player.useControls().setControls(true);
            return;
        }

        if (webview.isAnyPageOpen() && !webview.isSpecificPageOpen('wheelmenu')) {
            return;
        }

        if (selectedEntity) {
            const entityType = native.getEntityType(selectedEntity.scriptID);
            let options = [];

            if (entityType === 2) { // 车辆
                const isEngineOn = native.getIsVehicleEngineRunning(selectedEntity.scriptID);
                const isLocked = native.getVehicleDoorLockStatus(selectedEntity.scriptID) === 2; // 2表示上锁状态

                options.push({
                    icon: '🔒',
                    label: isLocked ? 'Unlock' : 'Lock',
                    description: isLocked ? 'Unlock the vehicle' : 'Lock the vehicle',
                    action: (player, vehicle) => {
                        if (isLocked) {
                            native.setVehicleDoorsLocked(vehicle.scriptID, 1); // 解锁
                        } else {
                            native.setVehicleDoorsLocked(vehicle.scriptID, 2); // 上锁
                        }
                    },
                });

                options.push({
                    icon: '🔧',
                    label: isEngineOn ? 'Stop Engine' : 'Start Engine',
                    description: isEngineOn ? 'Stop the vehicle engine' : 'Start the vehicle engine',
                    action: (player, vehicle) => {
                        native.setVehicleEngineOn(vehicle.scriptID, !isEngineOn, true, false); // 启动/停止引擎
                    },
                });

                options.push({
                    icon: '📦',
                    label: 'Open Trunk',
                    description: 'Open the trunk',
                    action: (player, vehicle) => {
                        native.setVehicleDoorOpen(vehicle.scriptID, 5, false, false); // 打开后备箱
                    },
                });

                options.push({
                    icon: '🛠️',
                    label: 'Repair',
                    description: 'Repair the vehicle',
                    action: (player, vehicle) => {
                        if (native.isVehicleModel(vehicle.scriptID, alt.hash('JET'))) {
                            native.setVehicleFixed(vehicle.scriptID); // 修理飞机
                        } else if (!native.isVehicleModel(vehicle.scriptID, alt.hash('JET'))) {
                            native.setVehicleFixed(vehicle.scriptID); // 修理其他车辆
                        } else {
                            alt.log('You do not have the required skills to repair this aircraft.');
                        }
                    },
                });

                // 添加其他选项...
            } else if (entityType === 1) { // 玩家
                options.push({
                    icon: '👋',
                    label: 'Greet',
                    description: 'Greet the player',
                    action: (player, targetPlayer) => {
                        alt.emit('chat:message', `You greeted ${targetPlayer.name}.`);
                    },
                });

                options.push({
                    icon: '💬',
                    label: 'Send Message',
                    description: 'Send a private message to the player',
                    action: (player, targetPlayer) => {
                        alt.emit('chat:message', `You sent a message to ${targetPlayer.name}.`);
                    },
                });

                // 添加其他选项...
            } else if (entityType === 3) { // 物体
                options.push({
                    icon: '🔄',
                    label: 'Rotate',
                    description: 'Rotate the object',
                    action: (player, object) => {
                        native.setEntityHeading(object.scriptID, native.getEntityHeading(object.scriptID) + 90);
                    },
                });

                options.push({
                    icon: '❌',
                    label: 'Remove',
                    description: 'Remove the object',
                    action: (player, object) => {
                        native.deleteObject(object.scriptID);
                    },
                });

                // 添加其他选项...
            }

            webview.show('wheelmenu', 'page');
            webview.emit('selectedEntity', {
                entityType,
                entityId: selectedEntity.scriptID,
                options,
            });
        }
    }
});

// 监听 Webview 发出的事件并执行相应操作
webview.on('executeAction', ({ action, entityId }) => {
    const player = alt.Player.local;
    let entity = null;

    const entityType = native.getEntityType(entityId);
    if (entityType === 2) {
        entity = alt.Vehicle.all.find(v => v.scriptID === entityId);
    } else if (entityType === 1) {
        entity = alt.Player.all.find(p => p.scriptID === entityId);
    } else if (entityType === 3) {
        entity = alt.Object.all.find(o => o.scriptID === entityId);
    }

    if (!entity) return;

    if (typeof action === 'function') {
        action(player, entity);
    }
});
