import options from '../options'
import * as consts from '../constants'
import { LynxchanPlatformHandler, LynxchanAccessor, createUI } from "../lynxchan-common";

const platformHandler = new LynxchanPlatformHandler(createUI(), new LynxchanAccessor());
platformHandler.addWojakifyButtons();
setInterval(() => platformHandler.addWojakifyButtons(), 5000);