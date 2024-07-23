<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useEvents } from '../../../../../webview/composables/useEvents.js';
import { AuthEvents } from '../../shared/authEvents.js';
import { useTranslate } from '@Shared/translate.js';

const { t } = useTranslate('en');

const events = useEvents();

const allValid = ref(false);
const isInvalid = ref(false);

const email = ref('');
const password = ref('');
const password2 = ref('');
const verificationCode = ref('');
const isEmailValid = ref(false);

function checkForm() {
    // 验证邮箱格式
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email.value)) {
        allValid.value = false;
        isEmailValid.value = false;
        console.log('bad username');
        return;
    } else {
        isEmailValid.value = true;
    }

    // 验证密码长度
    if (password.value.length < 6 || password2.value.length < 6) {
        allValid.value = false;
        return;
    }

    // 验证密码是否匹配
    if (password.value !== password2.value) {
        allValid.value = false;
        return;
    }

    // 验证验证码长度
    if (verificationCode.value.length !== 6) {
        allValid.value = false;
        return;
    }

    allValid.value = true;
}

function register() {
    isInvalid.value = false;

    if (!allValid.value) {
        return;
    }

    events.emitServer(AuthEvents.toServer.register, email.value, password.value, verificationCode.value);
}

function handleInvalid() {
    isInvalid.value = true;
}

function init() {
    events.on(AuthEvents.fromServer.invalidRegister, handleInvalid);
}

function sendVerificationCode() {
    if (isEmailValid.value) {
        events.emitServer(AuthEvents.toServer.sendVerificationCode, email.value);
    }
}

onMounted(init);
</script>

<template>
    <div class="flex flex-col gap-4">
        <span class="text-lg font-medium">{{ t('auth.span.register') }}</span>
        <span class="text-red-400 font-medium" v-if="isInvalid">{{ t('auth.span.register.error') }}</span>
        <div class="flex items-center">
            <input
                type="text"
                :placeholder="t('auth.span.email')"
                v-model="email"
                autocomplete="email"
                @input="checkForm"
                class="p-2 rounded bg-neutral-100 border border-neutral-300 placeholder:text-neutral-300 outline-none focus:border-blue-300 flex-grow"
            />
            <button
                class="ml-2 p-2 rounded bg-blue-300 text-white hover:bg-blue-200"
                :class="{ 'cursor-not-allowed bg-neutral-200': !isEmailValid, 'hover:bg-blue-200': isEmailValid }"
                :disabled="!isEmailValid"
                @click="sendVerificationCode"
            >
                {{ t('auth.span.getVerificationCode') }}
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
            :placeholder="t('auth.span.password')"
            v-model="password"
            autocomplete="password"
            @input="checkForm"
            class="p-2 rounded bg-neutral-100 border border-neutral-300 placeholder:text-neutral-300 outline-none focus:border-blue-300"
        />
        <input
            type="password"
            :placeholder="t('auth.span.password.again')"
            v-model="password2"
            autocomplete="password"
            @input="checkForm"
            class="p-2 rounded bg-neutral-100 border border-neutral-300 placeholder:text-neutral-300 outline-none focus:border-blue-300"
        />
        <button
            class="p-2 w-full rounded-lg text-center font-medium"
            :class="allValid ? ['bg-blue-300', 'hover:bg-blue-200'] : ['bg-neutral-200', 'cursor-default']"
            @click="allValid ? register() : () => {}"
        >
            {{ t('auth.span.register') }}
        </button>
    </div>
</template>

<style scoped>
* {
    font-family: "Inter", sans-serif;
    font-optical-sizing: auto;
    font-variation-settings: "slnt" 0;
    user-select: none;
}
</style>
