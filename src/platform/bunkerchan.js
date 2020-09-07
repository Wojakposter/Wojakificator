import options from '../options'
import * as consts from '../constants'
import { addWojakifyButtons, setUI, createUI} from "../lynxchan-common";

setUI(createUI());
addWojakifyButtons();
setInterval(addWojakifyButtons, 5000);