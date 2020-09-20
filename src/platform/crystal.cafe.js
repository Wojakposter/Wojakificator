import options from '../options'
import * as constants from '../constants'
import { TinyboardPlatformHandler, TinyboardAccessor, createUI} from '../tinyboard-common'

const platformHandler = new TinyboardPlatformHandler(createUI(), new TinyboardAccessor());
platformHandler.addWojakifyButtons();
setInterval(() => platformHandler.addWojakifyButtons(), 5000);
platformHandler.setupPostingHandler();