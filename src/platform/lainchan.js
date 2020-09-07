import options from '../options'
import * as constants from '../constants'
import { LainchanPlatformHandler } from '../lainchan-common'
import { VichanPostingPatcher, createUI } from '../vichan-common'

const platformHandler = new LainchanPlatformHandler(createUI());
platformHandler.addWojakifyButtons();
VichanPostingPatcher.setupPostingHandler();