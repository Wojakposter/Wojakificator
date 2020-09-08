import options from '../options'
import * as constants from '../constants'
import { LainchanAccessor } from '../lainchan-common'
import { VichanPostingPatcher, VichanPlatformHandler, createUI } from '../vichan-common'

const platformHandler = new VichanPlatformHandler(createUI(), new LainchanAccessor());
platformHandler.addWojakifyButtons();
setInterval(() => platformHandler.addWojakifyButtons(), 5000);
VichanPostingPatcher.setupPostingHandler();