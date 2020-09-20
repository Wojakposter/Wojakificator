import options from '../options'
import * as constants from '../constants'
import { VichanPlatformHandler, VichanAccessor, createUI } from '../vichan-common'

const platformHandler = new VichanPlatformHandler(createUI(), new VichanAccessor());
platformHandler.addWojakifyButtons();
setInterval(() => platformHandler.addWojakifyButtons(), 5000);
platformHandler.setupPostingHandler();