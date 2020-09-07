import { createWojakifyButton } from './ui'
import { memeficate } from './textUtil'
import { generateTextWojak } from './generator'
import { getPostContainer, UserInterfaceContainer, VichanPlatformHandler } from './vichan-common'
import options from './options'

export class LainchanPlatformHandler extends VichanPlatformHandler {
    constructor(ui: UserInterfaceContainer) {
        super(ui);
    }

    protected createTextWojakifyButton(id: string) {
        return createWojakifyButton('wojakify', 'Wojakify', () => {
            generateTextWojak(memeficate(getPostText(id), this.UI.seetheMode.checked), options[this.UI.sojakSelector.value]).then(wojak => this.handleWojakify(wojak, id));
        });
    }
}

export const extractText = (elements: any[]) => {
    const ret: string[] = [];
    let currentLine = ''
    const insertNextLine = text => {
        if(currentLine === '') {
            ret.push(text);
        } else {
            ret.push(currentLine);
            ret.push(text);
            currentLine = '';
        }
    }
    for(const e of elements) {
        if(e.tagName === 'A') {
            if(!e.innerText.startsWith(">>"))
                currentLine += e.innerText;
        } else if(e.tagName === 'SPAN') {
            if(e.className === 'quote' || e.className === 'heading' || e.className === 'spoiler')
                insertNextLine(e.innerText);
        } else if(e.tagName === 'STRONG' || e.tagName === 'EM' || e.tagName === 'CODE') {
            currentLine += e.innerText;
        } else if(e.tagName === 'PRE' || e.tagName === 'SMALL') {
            continue;
        } else if(e.tagName === 'BR') {
            if(currentLine !== '') {
                ret.push(currentLine);
                currentLine = '';
            }
        } else {
            currentLine += e.data;
        }
    }
    if(currentLine !== '')
        ret.push(currentLine);
    return ret.map(x => x.trim()).filter(x => x);
}

export const getPostText = (id: string) => {
    return extractText([...getPostContainer(id).querySelector('.body').childNodes as any])
}