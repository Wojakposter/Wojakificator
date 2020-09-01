import {quoteGreenColor} from './constants'
//#if _ORANGE_QUOTE
import {quoteOrangeColor} from './constants'
//#endif

export const canvasToFile = canvas => {
    return new Promise(resolve => canvas.toBlob(blob => resolve(new File([blob], "(you).png", {type: "image/png"}))));
}

export const writeToCanvas = (context, lines, x, y, textHeight) => {
    //#if _ORANGE_QUOTE === false
    context.fillStyle = quoteGreenColor;
    //#endif
    for(const line of lines) {
        //#if _ORANGE_QUOTE
        if(line.startsWith(">")) {
            context.fillStyle = quoteGreenColor;
        } else if(line.startsWith("<")) {
            context.fillStyle = quoteOrangeColor;
        }
        //#endif
        context.fillText(line, x, y);
        y += textHeight;
    }
}