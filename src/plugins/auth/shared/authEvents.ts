export const AuthEvents = {
    toServer: {
        login: 'auth:event:login',
        register: 'auth:event:register',
        sendVerificationCode: 'auth:event:send:verification:code',
        sendRecoverCode: 'auth:event:send:recover:code',
        recoverAccount: 'auth:event:recover',
    },
    toClient: {
        remember: 'auth:event:remember',
        cameraCreate: 'auth:event:camera:create',
        cameraDestroy: 'auth:event:camera:destroy',
    },
    fromServer: {
        invalidLogin: 'auth:event:invalid:login',
        invalidRegister: 'auth:event:invalid:register',
        showmessage: 'auth:event:show:message',
        invalidRecover:'auth:event:invalid:recover',
        changepage:'auth:event:change:page',
    },
};
