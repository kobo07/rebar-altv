<script lang="ts" setup>
import '../translate/index'; // Import translations

import { ref, onMounted } from 'vue';
import AuthLogin from './components/AuthLogin.vue';
import AuthRegister from './components/AuthRegister.vue';
import AuthRecover from './components/AuthRecover.vue'

import { useEvents } from '../../../../webview/composables/useEvents.js';
const events = useEvents();

import { useTranslate } from '@Shared/translate.js';
import { AuthEvents } from '../shared/authEvents.js';

const { t } = useTranslate('en');

const showLogin = ref(true);
const showRecover = ref(false);
const message = ref('');

events.on(AuthEvents.fromServer.showmessage, (message1: string) => {
    message.value = message1;
});

events.on(AuthEvents.fromServer.changepage, (page: string) => {
   if(page === 'login'){
         showLogin.value = true;
         showRecover.value = false;
   }
});

function toggleView() {
    showLogin.value = !showLogin.value;
    showRecover.value = false;
}

function showRecoverView() {
    showLogin.value = false;
    showRecover.value = true;
}
</script>

<template>
    <div class="flex items-center justify-center w-screen h-screen overflow-hidden text-neutral-950">
        <div class="flex items-center justify-center w-screen h-screen overflow-hidden text-neutral-950">
            <div class="bg-neutral-50 p-12 rounded-lg shadow-lg w-1/2">
                <div class="flex flex-row gap-6">
                    <div class="flex flex-col w-1/4">
                        <span
                            @click="toggleView"
                            class="font-medium cursor-pointer text-blue-500 hover:text-blue-300"
                        >
                            {{ showLogin && !showRecover ? t('auth.span.new.user') : t('auth.span.existing.user') }}
                        </span>
                        <span
                            v-if="showLogin && !showRecover"
                            @click="showRecoverView"
                            class="font-medium cursor-pointer text-blue-500 hover:text-blue-300 mt-2"
                        >
                            {{ t('auth.span.forgot.password') }}
                        </span>
                    </div>
                    <div class="flex flex-col w-3/4">
                        <AuthLogin v-if="showLogin && !showRecover" />
                        <AuthRegister v-else-if="!showLogin && !showRecover" />
                        <AuthRecover v-if="showRecover" />
                        <span class="text-red-400 font-medium">{{ message }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
