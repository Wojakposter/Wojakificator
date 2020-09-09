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

export interface ThreadAccessor {
    getPostText(id: string): string[];
    getPostImageURL(id: string, nth: number): string;
    getPostContainer(id: string): HTMLElement
}

export class VichanPlatformHandler implements UserInterfaceContainer {
    declare sojakSelector: HTMLSelectElement;
    declare seetheMode: HTMLInputElement;
    declare preview: HTMLInputElement;
    declare autoReply: HTMLInputElement;
    declare accessor: ThreadAccessor;
    declare recentWojak: File;

    constructor(ui: UserInterfaceContainer, accessor: ThreadAccessor) {
        Object.assign(this, ui);
        this.accessor = accessor;
        this.recentWojak = null;
    }

    protected handleWojakify(wojak: File, id: string) {
        this.recentWojak = wojak;
        if(this.preview.checked)
            this.accessor.getPostContainer(id).appendChild(createPreviewImage(wojak));
        if(this.autoReply.checked) {
            document.getElementsByName('post')[1].click();
        }
    }

    protected createImageWojakifyButton(id: string, nth: number) {
        return createWojakifyButton('wojakify-image', 'Wojakify', () => {
            generateImageWojak(this.accessor.getPostImageURL(id, nth), options[this.sojakSelector.value]).then(wojak => this.handleWojakify(wojak, id));
        });
    }

    protected createTextWojakifyButton(id: string) {
        return createWojakifyButton('wojakify', 'Wojakify', () => {
            generateTextWojak(memeficate(this.accessor.getPostText(id), this.seetheMode.checked), options[this.sojakSelector.value]).then(wojak => this.handleWojakify(wojak, id));
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

    public setupPostingHandler()
    {
        $(document).on('ajax_before_post', (e, formData: FormData) => {
            if(this.recentWojak) {
                formData.set('file', this.recentWojak);
                this.recentWojak = null;
            }
        });
    }
}

const extractText = (elements: any[]) => {
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

export class VichanAccessor implements ThreadAccessor {
    public getPostText(id: string): string[] {
        return extractText([...this.getPostContainer(id).querySelector('.body').childNodes as any]);
    }

    public getPostContainer(id: string) {
        return (document.getElementById('reply_' + id) || document.getElementById('op_' + id));
    }

    public getPostImageURL(id: string, nth: number): string {
        const imgContainer = (document.getElementById('reply_' + id) || document.getElementById('thread_' + id)).children[1].children[nth];
        if(imgContainer === undefined || imgContainer.children.length < 2)
            return 'none';
        const childList = imgContainer.children;
        return (childList[childList.length - 1] as HTMLAnchorElement).href;
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