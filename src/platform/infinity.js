import options from '../options'
import * as constants from '../constants'
import { createUI, VichanPlatformHandler } from '../vichan-common'
import { InfinityAccessor } from '../infinity-common'

const platformHandler = new VichanPlatformHandler(createUI(), new InfinityAccessor());
platformHandler.addWojakifyButtons();
setInterval(() => platformHandler.addWojakifyButtons(), 5000);
platformHandler.setupPostingHandler();