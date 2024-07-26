<template>
    <div class="flex flex-col gap-4">
        <span class="text-lg font-medium">{{ t('auth.span.recover') }}</span>
        <span class="text-red-400 font-medium" v-if="isInvalid">{{ t('auth.span.recover_error') }}</span>
        <div class="flex items-center">
            <input
                type="text"
                :placeholder="t('auth.span.email')"
                v-model="email"
                @input="checkForm"
                class="p-2 rounded bg-neutral-100 border border-neutral-300 placeholder:text-neutral-300 outline-none focus:border-blue-300 flex-grow"
            />
            <button
                class="ml-2 p-2 rounded bg-blue-300 text-white hover:bg-blue-200"
                  :class="{ 'cursor-not-allowed bg-neutral-200': !isEmailValid || cooldown > 0, 'hover:bg-blue-200': isEmailValid && cooldown === 0 }"
                :disabled="!isEmailValid|| cooldown > 0"
                @click="sendVerificationCode"
            >
            {{ cooldown > 0 ? `${cooldown}秒后可用` : t('auth.span.getVerificationCode') }}
            </button>
        </div>
        <input
            type="text"
            :placeholder="t('auth.span.verificationCode')"
            v-model="verificationCode"
            @input="checkForm"
            class="p-2 rounded bg-neutral-100 border border-neutral-300 placeholder:text-neutral-300 outline-none focus:border-blue-300"
        />
        <input
            type="password"
            :placeholder="t('auth.span.newPassword')"
            v-model="newPassword"
            @input="checkForm"
            class="p-2 rounded bg-neutral-100 border border-neutral-300 placeholder:text-neutral-300 outline-none focus:border-blue-300"
        />
        <input
            type="password"
            :placeholder="t('auth.span.confirmPassword')"
            v-model="confirmPassword"
            @input="checkForm"
            class="p-2 rounded bg-neutral-100 border border-neutral-300 placeholder:text-neutral-300 outline-none focus:border-blue-300"
        />
        <button
            class="p-2 w-full rounded-lg text-center font-medium"
            :class="allValid ? ['bg-blue-300', 'hover:bg-blue-200'] : ['bg-neutral-200', 'cursor-default']"
            @click="allValid ? recoverAccount() : () => {}"
        >
            {{ t('auth.span.recover') }}
        </button>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useEvents } from '../../../../../webview/composables/useEvents.js';
import { AuthEvents } from '../../shared/authEvents.js';
import { useTranslate } from '@Shared/translate.js';

const { t } = useTranslate('en');
const events = useEvents();

const email = ref('');
const verificationCode = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const allValid = ref(false);
const isInvalid = ref(false);
const isEmailValid = ref(false);

const cooldown = ref(0);
let cooldownTimer: NodeJS.Timeout | null = null;

function checkForm() {
    // 验证邮箱格式
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email.value)) {
        allValid.value = false;
        isEmailValid.value = false;
        return;
    } else {
        isEmailValid.value = true;
    }

    // 验证验证码长度
    if (verificationCode.value.length !== 6) {
        allValid.value = false;
        return;
    }

    // 验证新密码长度
    if (newPassword.value.length < 8) {
        allValid.value = false;
        return;
    }

    // 验证新密码和确认密码是否匹配
    if (newPassword.value !== confirmPassword.value) {
        allValid.value = false;
        return;
    }

    allValid.value = true;
}

function recoverAccount() {
    isInvalid.value = false;

    if (!allValid.value) {
        return;
    }

    events.emitServer(AuthEvents.toServer.recoverAccount, email.value, verificationCode.value, newPassword.value);
}

function handleInvalid() {
    isInvalid.value = true;
}

function sendVerificationCode() {
    if (isEmailValid.value) {
        events.emitServer(AuthEvents.toServer.sendRecoverCode, email.value);
    }
}

function startCooldown() {
  cooldown.value = 60;
  cooldownTimer = setInterval(() => {
    cooldown.value -= 1;
    if (cooldown.value <= 0) {
      clearInterval(cooldownTimer!);
      cooldown.value = 0;
    }
  }, 1000);
}



events.on(AuthEvents.fromServer.invalidRecover, handleInvalid);
</script>

<style scoped>
* {
    font-family: "Inter", sans-serif;
    font-optical-sizing: auto;
    font-variation-settings: "slnt" 0;
    user-select: none;
}
</style>
