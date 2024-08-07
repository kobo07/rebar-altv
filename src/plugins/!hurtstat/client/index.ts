import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import { getDirectionFromRotation } from '@Client/utility/math/index.js';
import { drawText2D, drawText3D } from '@Client/screen/textlabel.js';
import * as native from 'natives';
import * as alt from 'alt-client';
import { bodyPartToBoneId } from '../shared/config.js';
import { DamageRecord } from '../server/index.js';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();

/*
alt.on('weaponDamage', (target: alt.Entity, weaponHash: number, damage: number, offset: alt.Vector3, bodyPart: number, sourceEntity: alt.Entity) => {
    if (!target || !native.isEntityAPed(target)) {
        return;
    }

    if (target.type === 0 || target.type === 2) {
        try {
            const boneId = bodyPartToBoneId[bodyPart];
            const boneIndex = native.getPedBoneIndex(target.scriptID, boneId);
            if (boneIndex === -1) {
                alt.log('获取骨骼索引失败:', boneIndex);
                return;
            }

            const tick = alt.everyTick(() => {
                if (!native.doesEntityExist(target.scriptID) || native.isEntityDead(target.scriptID, true)) {
                    alt.clearEveryTick(tick);
                    return;
                }

                const bonePos = native.getPedBoneCoords(target.scriptID, boneIndex, 0, 0, 0);
                if (!bonePos) {
                    alt.log('获取骨骼位置失败:', boneIndex);
                    return;
                }
                // 绘制红色光效
                native.drawLightWithRange(
                    bonePos.x, bonePos.y, bonePos.z, // 位置
                    255, 0, 0, // 光效颜色 (红色)
                    3.0, // 光效范围
                    1.0 // 光效亮度
                );


            });

            alt.log(`击中!`);
        } catch (error) {
            alt.log('处理击中事件时发生错误:', error);
        }
    }
});
*/



/*
let hur: DamageRecord[] = [];

alt.onServer('hurt:sync', (hurt: DamageRecord[]) => {
    hur = hurt
})

const view = useWebview();
function update() {
    const stats: DamageRecord[] = hur;
    view.emit('sendhur', stats);
}

alt.setInterval(update, 50);
*/

