import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import * as alt from 'alt-client';
import native from 'natives'


const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();

useWebview().show('hud', 'overlay');