import * as alt from 'alt-client';
import { useRebarClient } from '../../../main/client/index.js';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();


