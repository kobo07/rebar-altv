import { useRebarClient } from '@Client/index.js';
import { useWebview } from '@Client/webview/index.js';
import { getDirectionFromRotation } from '@Client/utility/math/index.js';
import { drawText2D, drawText3D } from '@Client/screen/textlabel.js';
import * as native from 'natives';
import * as alt from 'alt-client';
import { bodyPartToBoneId } from '../shared/config.js';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();
const messenger = Rebar.messenger.useMessenger();



