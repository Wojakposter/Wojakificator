import options from './options'
import { createCheckbox, createSelect, createWojakifyButton } from './ui'
import { TinyboardAccessor, TinyboardPlatformHandler, UserInterfaceContainer } from './tinyboard-common'
import { generateTextWojak, generateImageWojak } from './generator'
import { memeficate } from './textUtil'

export class VichanPlatformHandler extends TinyboardPlatformHandler {
    declare boundOnTextWojakify: (id: string) => void;
    declare boundOnImageWojakify: (id: string, nth: number) => void;

    constructor(ui: UserInterfaceContainer, accessor: TinyboardAccessor) {
        super(ui, accessor);
        this.boundOnTextWojakify = this.onTextWojakify.bind(this);
        this.boundOnImageWojakify = this.onImageWojakify.bind(this);
    }

    protected onImageWojakify(id: string, nth: number) {
        generateImageWojak(this.accessor.getPostImageURL(id, nth), options[this.sojakSelector.value]).then(wojak => this.handleGenerateWojak(wojak, id));
    }

    protected onTextWojakify(id: string) {
        generateTextWojak(memeficate(this.accessor.getPostText(id), this.seetheMode.checked), options[this.sojakSelector.value]).then(wojak => this.handleGenerateWojak(wojak, id))
    }

    public addWojakifyButtons() {
        document.querySelectorAll('.post > .intro').forEach(intro => {
            if(intro.querySelector('.wojakify') === null) {
                const id = (intro.getElementsByClassName('post_no')[1] as HTMLAnchorElement).innerText;
                intro.insertBefore(createWojakifyButton('wojakify', 'Wojakify', this.boundOnTextWojakify, id), intro.children[0]);
                let fileContainer = intro.nextElementSibling;
                if(fileContainer.className !== 'files')
                    fileContainer = intro.parentElement.previousElementSibling;
                fileContainer.querySelectorAll('.file').forEach((file, i) => {
                    const fileInfo = file.children[0];
                    if(fileInfo === undefined || fileInfo.className !== 'fileinfo')
                        return;
                    fileInfo.insertBefore(createWojakifyButton('wojakify-image', 'Wojakify Image', this.boundOnImageWojakify, id, i), fileInfo.childNodes[0]);
                });
            }
        });
    }

    public setupPostingHandler() {
        $(document).on('ajax_before_post', (e, formData: FormData) => {
            if(this.recentWojak)
                formData.set('file', this.recentWojak);
        });
        $(document).on('ajax_after_post', () => this.recentWojak = null);
    }
}

export class VichanAccessor extends TinyboardAccessor {
    public getPostImageURL(id: string, nth: number = 0) {
        const imgContainer = this.getPostContainer(id).querySelector('.files').children[nth];
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
    const preview = createCheckbox('preview', 'Preview', true);

    const header = document.querySelector('.boardlist');
    [wojakSelector, ...seethMode, ...autoReply, ...preview].forEach(e => header.appendChild(e));
    return {
        sojakSelector: wojakSelector,
        seetheMode: seethMode[1],
        autoReply: autoReply[1],
        preview: preview[1],
        imageMode: undefined
    }
}