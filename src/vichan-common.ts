import options from './options'
import { createWojakifyButton, createSelect, createCheckbox, createPreviewImage } from './ui'
import { generateImageWojak, generateTextWojak} from './generator'
import { memeficate } from './textUtil';

export type TextWojakifyButtonCreator = (id: string) => HTMLButtonElement
export type ImageWojakifyButtonCreator = (id: string, nth: number) => HTMLButtonElement;

export interface UserInterfaceContainer {
    sojakSelector: HTMLSelectElement;
    seetheMode: HTMLInputElement;
    preview: HTMLInputElement;
    autoReply: HTMLInputElement;
}

export class VichanPlatformHandler {
    declare UI: UserInterfaceContainer;

    constructor(ui: UserInterfaceContainer) {
        this.UI = ui;
    }

    protected handleWojakify(wojak: File, id: string) {
        VichanPostingPatcher.recentWojak = wojak;
        if(this.UI.preview.checked)
            getPostContainer(id).appendChild(createPreviewImage(wojak));
        if(this.UI.autoReply.checked) {
            document.getElementsByName('post')[1].click();
        }
    }

    protected createImageWojakifyButton(id: string, nth: number) {
        return createWojakifyButton('wojakify-image', 'Wojakify', () => {
            generateImageWojak(getPostImageURL(id, nth), options[this.UI.sojakSelector.value]).then(wojak => this.handleWojakify(wojak, id));
        });
    }

    protected createTextWojakifyButton(id: string) {
        return createWojakifyButton('wojakify', 'Wojakify', () => {
            generateTextWojak(memeficate(getPostText(id), this.UI.seetheMode.checked), options[this.UI.sojakSelector.value]).then(wojak => this.handleWojakify(wojak, id));
        });
    }

    public addWojakifyButtons()
    {
        document.querySelectorAll('.post > .intro').forEach(intro => {
            if(intro.querySelector('.wojakify') === null) {
                const id = (intro.getElementsByClassName('post_no')[1] as HTMLAnchorElement).innerText;
                intro.insertBefore(this.createTextWojakifyButton(id), intro.children[0]);
                let fileContainer = intro.nextElementSibling;
                if(fileContainer.className !== 'files')
                    fileContainer = intro.parentElement.previousElementSibling;
                fileContainer.querySelectorAll('.file').forEach((file, i) => {
                    const fileInfo = file.children[0];
                    if(fileInfo === undefined || fileInfo.className !== 'fileinfo')
                        return;
                    fileInfo.insertBefore(this.createImageWojakifyButton(id, i), fileInfo.childNodes[0]);
                });
            }
        });
    }
}

export const createUI = (): UserInterfaceContainer => {
    const wojakSelector = createSelect("soyjakSelector", options);
    const seethMode = createCheckbox("seetheMode", "Seethe Mode");
    const autoReply = createCheckbox("autoReply", "Auto Reply");
    const preview = createCheckbox('preview', 'Preview');

    const header = document.querySelector('.boardlist');
    [wojakSelector, ...seethMode, ...autoReply, ...preview].forEach(e => header.appendChild(e));
    return {
        sojakSelector: wojakSelector,
        seetheMode: seethMode[1],
        autoReply: autoReply[1],
        preview: preview[1]
    }
}

export const getPostImageURL = (id: string, nth: number) => {
    const imgContainer = (document.getElementById('reply_' + id) || document.getElementById('thread_' + id)).children[1].children[nth];
    if(imgContainer === undefined || imgContainer.children.length < 2)
        return 'none';
    const childList = imgContainer.children;
    return (childList[childList.length - 1] as HTMLAnchorElement).href;
}

export const getPostContainer = (id: string) => {
    return (document.getElementById('reply_' + id) || document.getElementById('op_' + id));
}

export const extractText = (elements: any[]) => {
    let ret: string[] = [];
    for(const e of elements) {
        if(e.classList.contains('empty')) {
            continue;
        } else if(e.classList.contains('ltr')) {
            const containedElement = e.children[0];
            if(containedElement.tagName === 'A' && !containedElement.innerText.startsWith('>>')) {
                ret.push(e.innerText);
            } else {
                ret.push(e.data || e.innerText);
            }
        }
    }

    return ret;
}

export const getPostText = id => {
    return extractText([...getPostContainer(id).querySelector('.body').childNodes as any])
}

export const VichanPostingPatcher = {
    recentWojak: null,
    setupPostingHandler: () => {
        $(document).on('ajax_before_post', (e, formData: FormData) => {
            if(VichanPostingPatcher.recentWojak) {
                formData.set('file', VichanPostingPatcher.recentWojak);
                VichanPostingPatcher.recentWojak = null;
            }
        })
    }
}