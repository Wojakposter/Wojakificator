import {wrapText} from './textUtil'
import {writeToCanvas, canvasToFile} from './canvasUtil'
import {loadAsImage} from './imageUtil'
import * as constants from './constants'

const centerOffset = (partSize: number, wholeSize: number) => Math.floor((wholeSize - partSize) / 2);

export const generateTextWojak = (postText: string[], selectedWojakURI: string): Promise<File> => {
    const canvas = document.createElement('canvas');
    return loadAsImage(selectedWojakURI).then(img => {
        canvas.width = img.width;
        canvas.height = img.height + 100;
        const ctx = canvas.getContext('2d');
        const font = constants.fontSize + 'px ' + constants.fontName;

        ctx.font = font;
        const lines = wrapText(ctx, postText, img.width);
        canvas.height += lines.length * constants.fontSize;

        ctx.fillStyle = constants.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = font;
        writeToCanvas(ctx, lines, 0, img.height + 100, constants.fontSize);

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);
        return canvasToFile(canvas);
    });
}

export const generateImageWojak = (postImageURL: string | 'none', selectedWojakURI: string): Promise<File> => {
    const canvas = document.createElement("canvas");
    if(postImageURL === "none")
        return Promise.reject("Cannot wojakify-image a post without an image");
    return Promise.all([selectedWojakURI, constants.speechBubbleDataURL, postImageURL].map(loadAsImage)).then(args => {
        const wojak = args[0];
        const speechBubble = args[1];
        const postImage = args[2];

        canvas.width = wojak.width + speechBubble.width;
        canvas.height = Math.max(wojak.height, speechBubble.height);
        
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = constants.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(wojak, 0, canvas.height - wojak.height);
        ctx.drawImage(speechBubble, wojak.width, canvas.height - speechBubble.height);

        const scaledWidth = Math.min(postImage.width, constants.maxScaledImageWidth);
        const scaledHeight = Math.min(postImage.height, constants.maxScaledImageHeight);
        ctx.drawImage(postImage, wojak.width + 80 + centerOffset(scaledWidth, constants.maxScaledImageWidth),
                                 (canvas.height - speechBubble.height) + 50 + centerOffset(scaledHeight, constants.maxScaledImageHeight),
                                 scaledWidth, scaledHeight);
        return canvasToFile(canvas);
    });
}