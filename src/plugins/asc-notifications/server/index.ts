import * as alt from 'alt-server';

import { addNotification } from './src/controller.js';
import { NotificationConfig, NotificationTypes } from '../shared/config.js';

import { useApi } from '@Server/api/index.js';
import { useRebar } from '@Server/index.js';


import './src/api.js';

const api = useApi();
const Rebar = useRebar();

async function init() {
    // 等待 'character-creator-api' 准备好，最长等待 30 秒
    await alt.Utils.waitFor(() => api.isReady('character-creator-api'), 30000);

    const charSelectApi = await api.getAsync('character-creator-api');

    // 注册角色创建事件的处理程序
    charSelectApi.onCreate(handleCharacterCreated);
    // 注册跳过角色创建事件的处理程序
    charSelectApi.onSkipCreate(handleCharacterCreateSkip);
}

function handleCharacterCreated(player: alt.Player) {
    // 使用玩家数据获取角色文档
    const playerData = Rebar.document.character.useCharacter(player).get();
    // 添加成功创建角色的通知
    addNotification(player, {
        icon: NotificationTypes.success,
        title: '热烈欢迎',
        subTitle: '角色创建成功。',
        message: `欢迎来到蛋城，${playerData.name}！`,
    })
}

function handleCharacterCreateSkip(player: alt.Player) {
    // 使用玩家数据获取角色文档
    const playerData = Rebar.document.character.useCharacter(player).get();
    // 添加成功加载角色的通知
    addNotification(player, {
        icon: NotificationTypes.info,
        title: '欢迎回来',
        subTitle: '你的角色已成功加载。',
        message: `欢迎来到蛋城，${playerData.name}！`,
    })
}

// 如果启用了 Rebar 选择器通知配置
if(NotificationConfig.enableRebarSelector)
{
    init();
}

