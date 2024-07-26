import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { AuthEvents } from '../shared/authEvents.js';
import { Account } from '@Shared/types/account.js';
import { useTranslate } from '@Shared/translate.js';
import '../translate/index.js';

import nodemailer from 'nodemailer';
import crypto from 'crypto';

const Rebar = useRebar();
const { t } = useTranslate('en');

let verificationCodes = {};
let recoverVerificationCodes = {};

// 配置邮件发送
const transporter = nodemailer.createTransport({
    service: 'QQ',
    port: 465,
    secure: true,
    auth: {
        user: '1157394401@qq.com',
        pass: 'rufraqznwtujieig',
    },
});

// 生成验证码
function generateVerificationCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// 定时清理过期验证码
alt.setInterval(() => {
    const now = Date.now();
    for (const email in verificationCodes) {
        if (verificationCodes[email].expirationTime < now) {
            delete verificationCodes[email];
        }
    }
    for (const email in recoverVerificationCodes) {
        if (recoverVerificationCodes[email].expirationTime < now) {
            delete recoverVerificationCodes[email];
        }
    }
}, 60 * 1000 * 10); // 每10分钟检查一次

// 处理发送验证码
async function handleSendVerificationCode(player: alt.Player, email: string, isRecover: boolean) {
    const code = generateVerificationCode();
    const expirationTime = Date.now() + 10 * 60 * 1000; // 验证码有效时间10分钟
    if (isRecover) {
        recoverVerificationCodes[email] = { code, expirationTime };
    } else {
        verificationCodes[email] = { code, expirationTime };
    }

    const subject = isRecover ? '蛋城 - 账户找回验证码' : '蛋城 - 账户注册验证码';
    const text = `亲爱的用户，\n\n感谢您${isRecover ? '游玩' : '注册'}蛋城！您的验证码是：${code}，有效期为10分钟。请在有效期内使用验证码完成${isRecover ? '找回' : '注册'}。\n\n如有任何问题，请联系我们的客服团队。\n\n祝好，\n蛋城客服团队`;
    const html = `<p>亲爱的用户，</p>
                  <p>感谢您${isRecover ? '游玩' : '注册'}蛋城！您的验证码是：<strong>${code}</strong>，有效期为10分钟。请在有效期内使用验证码完成${isRecover ? '找回' : '注册'}。</p>
                  <p>如有任何问题，请联系我们的客服团队。</p>
                  <p>祝好，<br>蛋城客服团队</p>`;

    const mailOptions = {
        from: '"蛋城客服团队" <1157394401@qq.com>',
        to: email,
        subject,
        text,
        html,
    };

    transporter.sendMail(mailOptions, (error) => {
        const webview = Rebar.player.useWebview(player);
        if (error) {
            webview.emit(AuthEvents.fromServer.showmessage, '发送验证码失败');
        } else {
            webview.emit(AuthEvents.fromServer.showmessage, '验证码发送成功');
        }
    });
}

// 处理发送验证码事件
alt.onClient(AuthEvents.toServer.sendVerificationCode, (player: alt.Player, email: string) => {
    handleSendVerificationCode(player, email, false);
});

alt.onClient(AuthEvents.toServer.sendRecoverCode, (player: alt.Player, email: string) => {
    handleSendVerificationCode(player, email, true);
});

// 处理账户恢复事件
alt.onClient(AuthEvents.toServer.recoverAccount, async (player: alt.Player, email: string, verificationCode: string, newPassword: string) => {
    const webview = Rebar.player.useWebview(player);
    let account = await db.get<Account>({ email }, Rebar.database.CollectionNames.Accounts);
    if (!account) {
        webview.emit(AuthEvents.fromServer.showmessage, '该邮箱未被注册');
        return;
    }
    const verification = recoverVerificationCodes[email];
    if (!verification || verification.code !== verificationCode || Date.now() > verification.expirationTime) {
        webview.emit(AuthEvents.fromServer.invalidRecover);
        webview.emit(AuthEvents.fromServer.showmessage, '验证码不正确或已过期');
        return;
    }
    await db.update<Account>({ _id: account._id, password: Rebar.utility.password.hash(newPassword) }, Rebar.database.CollectionNames.Accounts);
    webview.emit(AuthEvents.fromServer.showmessage, '密码重置成功，请使用新密码登录');
    webview.emit(AuthEvents.fromServer.changepage, 'Login');
});

type AccountData = { token: string } & Account;

const loginCallbacks: Array<(player: alt.Player) => void> = [];
const loggedInPlayers: Map<number, string> = new Map<number, string>();
const sessionKey = 'can-authenticate';
const db = Rebar.database.useDatabase();

function setAccount(player: alt.Player, account: Account) {
    Rebar.document.account.useAccountBinder(player).bind(account);
    Rebar.player.useWebview(player).hide('Auth');
    Rebar.player.useNative(player).invoke('triggerScreenblurFadeOut', 1000);
    player.deleteMeta(sessionKey);
    player.dimension = 0;
    player.emit(AuthEvents.toClient.cameraDestroy);
    loggedInPlayers.set(player.id, account._id);
    for (let cb of loginCallbacks) {
        cb(player);
    }
}

function getHash(player: alt.Player) {
    return Rebar.utility.sha256(
        player.ip + player.hwidHash + player.hwidExHash + player.socialID + player.socialClubName
    );
}

async function updateRememberMe(player: alt.Player, _id: string) {
    await db.update<AccountData>({ _id, token: getHash(player) }, Rebar.database.CollectionNames.Accounts);
}

async function tryRememberMe(player: alt.Player): Promise<boolean> {
    const token = getHash(player);
    const account = await db.get<AccountData>({ token }, Rebar.database.CollectionNames.Accounts);
    if (!account) {
        return false;
    }

    setAccount(player, account);
    return true;
}

async function handleLogin(player: alt.Player, email: string, password: string, rememberMe: boolean) {
    if (!player.getMeta(sessionKey)) {
        player.kick(t('auth.kick.sessionKey'));
        return;
    }

    const account = await db.get<Account>({ email }, Rebar.database.CollectionNames.Accounts);
    const webview = Rebar.player.useWebview(player);
    if (!account) {
        webview.emit(AuthEvents.fromServer.invalidLogin);
        return;
    }

    if (!Rebar.utility.password.check(password, account.password)) {
        webview.emit(AuthEvents.fromServer.invalidLogin);
        return;
    }

    if (Array.from(loggedInPlayers.values()).includes(account._id)) {
        player.kick(t('auth.kick.alreadyLoggedIn'));
        return;
    }

    if (rememberMe) {
        await updateRememberMe(player, account._id);
    }

    setAccount(player, account);
}

async function handleRegister(player: alt.Player, email: string, password: string, verificationCode: string) {
    if (!player.getMeta(sessionKey)) {
        player.kick(t('auth.kick.sessionKey'));
        return;
    }

    let account = await db.get<Account>({ email }, Rebar.database.CollectionNames.Accounts);
    const webview = Rebar.player.useWebview(player);
    if (account) {
        webview.emit(AuthEvents.fromServer.invalidRegister);
        webview.emit(AuthEvents.fromServer.showmessage, '该邮箱已被注册');
        return;
    }

   const verification = verificationCodes[email];
    if (!verification || verification.code !== verificationCode || Date.now() > verification.expirationTime) {
        webview.emit(AuthEvents.fromServer.invalidRegister);
        webview.emit(AuthEvents.fromServer.showmessage, '验证码不正确或已过期');
        return;
    }

    const _id = await db.create<Partial<Account>>(
        { email, password: Rebar.utility.password.hash(password) },
        Rebar.database.CollectionNames.Accounts
    );
    if (!_id) {
        webview.emit(AuthEvents.fromServer.invalidRegister);
        webview.emit(AuthEvents.fromServer.showmessage, '注册失败');
        return;
    }

    account = await db.get<Account>({ _id }, Rebar.database.CollectionNames.Accounts);
    if (!account) {
        webview.emit(AuthEvents.fromServer.invalidRegister);
        webview.emit(AuthEvents.fromServer.showmessage, '注册失败');
        return;
    }

    setAccount(player, account);
}

async function handleConnect(player: alt.Player) {
    const didLogin = await tryRememberMe(player);
    if (didLogin) {
        return;
    }

    player.dimension = player.id + 1;
    player.setMeta(sessionKey, true);
    player.emit(AuthEvents.toClient.cameraCreate);
    Rebar.player.useWebview(player).show('Auth', 'page');
    Rebar.player.useNative(player).invoke('triggerScreenblurFadeIn', 1000);
}

async function handleDisconnect(player: alt.Player) {
    loggedInPlayers.delete(player.id);
}

alt.onClient(AuthEvents.toServer.login, handleLogin);
alt.onClient(AuthEvents.toServer.register, handleRegister);
alt.on('playerConnect', handleConnect);
alt.on('playerDisconnect', handleDisconnect);

export function useAuth() {
    function onLogin(callback: (player: alt.Player) => void) {
        loginCallbacks.push(callback);
    }

    return {
        onLogin,
    };
}

declare global {
    export interface ServerPlugin {
        ['auth-api']: ReturnType<typeof useAuth>;
    }
}

Rebar.useApi().register('auth-api', useAuth());
