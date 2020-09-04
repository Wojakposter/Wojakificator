import {quoteGreenColor} from './constants'
//#if _ORANGE_QUOTE
import {quoteOrangeColor} from './constants'
//#endif

export const canvasToFile = (canvas: HTMLCanvasElement): Promise<File> => {
    return new Promise(resolve => canvas.toBlob(blob => resolve(new File([blob], "(you).png", {type: "image/png"}))));
}

export const writeToCanvas = (context: CanvasRenderingContext2D, lines: string[], x: number, y: number, textHeight: number) => {
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