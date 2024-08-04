import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import * as native from 'natives';
import * as alt from 'alt-client';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();

// 用于存储选中的实体
let selectedEntity = null;

// 用于存储当前选项
let currentOptions = [];

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
    let nearestDistance = 4; // 距离超过4米就不再选中

    // 优先级：车辆 > 玩家 > 物体

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

    // 当玩家在车内时，默认选中车辆
    if (alt.Player.local.vehicle) {
        nearestEntity = alt.Player.local.vehicle;
    }

    // 如果选中实体改变，重置高亮并更新选中实体
    if (nearestEntity !== selectedEntity) {
        selectedEntity = nearestEntity;
    }
}

function drawMarker(entity) {
    if (!entity) return;
    const entityPos = native.getEntityCoords(entity.scriptID, true);

    // 使用 MarkerTypeChevronUpx1 类型的标记，在实体上方绘制一个标记
    native.drawMarker(
        20, entityPos.x, entityPos.y, entityPos.z + 2.5, 0, 0, 0, 0, 180, 0, 0.5, 0.5, 0.5,
        255, 255, 255, 150, false, true, 2, false, null, null, false
    );
}


// 每帧更新选中实体并绘制标记
alt.everyTick(() => {
    updateSelectedEntity();
    if ( webview.isSpecificPageOpen('wheelmenu') && selectedEntity) {
        drawMarker(selectedEntity);
    }
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
            let targetLabel = '';

            if (entityType === 2) { // 车辆
                targetLabel = '载具';
                const isEngineOn = native.getIsVehicleEngineRunning(selectedEntity.scriptID);
                const isLocked = native.getVehicleDoorLockStatus(selectedEntity.scriptID) === 2; // 2表示上锁状态

                options.push({
                    icon: '🔒',
                    label: isLocked ? '解锁' : '上锁',
                    description: isLocked ? '解锁车辆' : '锁上车辆',
                    action: () => {
                        native.setVehicleDoorsLocked(selectedEntity.scriptID, isLocked ? 1 : 2); // 解锁/上锁
                    }
                });

                options.push({
                    icon: '🔧',
                    label: isEngineOn ? '熄火' : '启动引擎',
                    description: isEngineOn ? '熄灭车辆引擎' : '启动车辆引擎',
                    action: () => {
                        native.setVehicleEngineOn(selectedEntity.scriptID, !isEngineOn, true, false); // 启动/停止引擎
                    }
                });

                options.push({
                    icon: '📦',
                    label: '打开后备箱',
                    description: '打开车辆后备箱',
                    action: () => {
                        native.setVehicleDoorOpen(selectedEntity.scriptID, 5, false, false); // 打开后备箱
                    }
                });

                options.push({
                    icon: '🛠️',
                    label: '修理',
                    description: '修理车辆',
                    action: () => {
                        native.setVehicleFixed(selectedEntity.scriptID); // 修理车辆
                    }
                });

            } else if (entityType === 1) { // 玩家
                targetLabel = '玩家';

                options.push({
                    icon: '👋',
                    label: '打招呼',
                    description: '向玩家打招呼',
                    action: () => {
                        alt.emit('chat:message', `你向 ${selectedEntity.name} 打了个招呼.`);
                    }
                });

                options.push({
                    icon: '💬',
                    label: '发送消息',
                    description: '发送私人消息给玩家',
                    action: () => {
                        alt.emit('chat:message', `你向 ${selectedEntity.name} 发送了一条消息.`);
                    }
                });

            } else if (entityType === 3) { // 物体
                targetLabel = '物体';

                options.push({
                    icon: '🔄',
                    label: '旋转',
                    description: '旋转物体',
                    action: () => {
                        native.setEntityHeading(selectedEntity.scriptID, native.getEntityHeading(selectedEntity.scriptID) + 90);
                    }
                });

                options.push({
                    icon: '❌',
                    label: '移除',
                    description: '移除物体',
                    action: () => {
                        native.deleteObject(selectedEntity.scriptID);
                    }
                });
            }

            currentOptions = options; // 更新当前选项

            Rebar.player.useControls().setControls(false);

            webview.show('wheelmenu', 'page');
            webview.emit('selectedEntity', {
                entityType,
                entityId: selectedEntity.scriptID,
                options: options.map(option => ({
                    icon: option.icon,
                    label: option.label,
                    description: option.description
                })), // 只发送可序列化的数据
                targetLabel,
            });
        }
    }
});

// 监听 Webview 发出的事件并执行相应操作
webview.on('executeAction', ({ actionIndex, entityId }) => {
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

    if (currentOptions[actionIndex] && typeof currentOptions[actionIndex].action === 'function') {
        currentOptions[actionIndex].action(player, entity);
    }

    webview.hide('wheelmenu');
    Rebar.player.useControls().setControls(true);
});
