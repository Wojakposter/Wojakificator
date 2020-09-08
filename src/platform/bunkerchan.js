import options from '../options'
import * as consts from '../constants'
import { LynxchanPlatformHandler, createUI } from "../lynxchan-common";

const platformHandler = new LynxchanPlatformHandler(createUI());
platformHandler.addWojakifyButtons();
setInterval(() => platformHandler.addWojakifyButtons(), 5000);