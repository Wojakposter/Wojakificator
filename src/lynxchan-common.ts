import { createWojakifyButton, createSelect, createCheckbox } from "./ui";
import { generateTextWojak, generateImageWojak } from "./generator";
import options from './options'
import { memeficate } from "./textUtil";

import "core-js/features/array/flat-map";

export interface UserInterfaceContainer {
    sojakSelector: HTMLSelectElement;
    seetheMode: HTMLInputElement;
    autoReply: HTMLInputElement;
}

export interface ThreadAccessor {
    getPostText(id: string): string[];
    getPostImageURL(id: string, nth: number): string;
}

declare namespace postCommon {
    function addSelectedFile(selectedFile: File): void
}

declare namespace qr {
    function showQr(id: string): void;
}

declare namespace thread {
    function postReply(): void
}

export const createUI = (): UserInterfaceContainer => {
    const wojakSelector = createSelect("soyjakSelector", options);
    const seethMode = createCheckbox("seetheMode", "Seethe Mode");
    const autoReply = createCheckbox("autoReply", "Auto Reply");

    const header = document.getElementById("threadHeader");
    const navOptions = document.getElementById("navOptionsSpan");
    [wojakSelector, ...seethMode, ...autoReply].forEach(e => header.insertBefore(e, navOptions));
    return {
        sojakSelector: wojakSelector,
        seetheMode: seethMode[1],
        autoReply: autoReply[1]
    }
}

export class LynxchanPlatformHandler implements UserInterfaceContainer {
    declare seetheMode: HTMLInputElement;
    declare sojakSelector: HTMLSelectElement;
    declare autoReply: HTMLInputElement;
    declare accessor: ThreadAccessor;
    declare boundOnTextWojakify: (id: string) => void;
    declare boundOnImageWojakify: (id: string, nth: number) => void;

    constructor(ui: UserInterfaceContainer, accessor: ThreadAccessor) {
        Object.assign(this, ui);
        this.accessor = accessor;
        this.boundOnTextWojakify = this.onTextWojakify.bind(this);
        this.boundOnImageWojakify = this.onImageWojakify.bind(this);
    }

    protected handleGenerateWojak(wojak: File, id: string) {
        postCommon.addSelectedFile(wojak);
        qr.showQr(id);
        if(this.autoReply.checked) {
            (document.getElementById("fieldMessage") as HTMLInputElement).value = ">>" + id;
            thread.postReply();
        }
    }

    protected onImageWojakify(id: string, nth: number) {
        generateImageWojak(this.accessor.getPostImageURL(id, nth), options[this.sojakSelector.value]).then(wojak => this.handleGenerateWojak(wojak, id));
    }

    protected onTextWojakify(id: string) {
        generateTextWojak(memeficate(this.accessor.getPostText(id), this.seetheMode.checked), options[this.sojakSelector.value]).then(wojak => this.handleGenerateWojak(wojak, id));
    }
    
    public addWojakifyButtons() {
        document.querySelectorAll(".postInfo, .opHead").forEach(postInfo => {
            if(postInfo.querySelector(".wojakify") === null && postInfo.closest(".quoteTooltip") === null) {
                const id = (postInfo.querySelector(".linkQuote") as HTMLAnchorElement).innerText;
                postInfo.insertBefore(createWojakifyButton('wojakify', 'Wojakify', this.boundOnTextWojakify, id), postInfo.childNodes[0]);
                (postInfo.classList.contains("opHead") ? postInfo.previousElementSibling : postInfo.nextElementSibling.nextElementSibling).querySelectorAll(".uploadDetails").forEach((uploadInfo, i) => {
                    uploadInfo.insertBefore(createWojakifyButton('wojakify-image', 'Wojakify Image', this.boundOnImageWojakify, id, i), uploadInfo.childNodes[0]);
                });
            }
        });
    }
}

const extractText = (elements: any[]) => {
    elements = elements.filter(e => !(e.className || "").split(' ').includes('quoteLink'));
    const ret: string[] = [];
    for(const e of elements) {
        if(ret.length === 0) {
            ret.push(e.data || e.innerText);
            continue;
        }

        if(e.tagName === "EM" || e.tagName === "STRONG" || e.tagName === "S" || e.tagName === "U") {
            ret[ret.length - 1] += e.innerText;
        } else if(e.tagName === "A") {
            ret.push(e.innerText);
        } else if(e.tagName === "SPAN") {
            if(e.className === "greenText" || e.className === "orangeText") {
                ret.push(e.innerText);
            } else {
                ret[ret.length - 1] += e.innerText;
            }
        } else if(e.data !== undefined) {
            ret[ret.length - 1] += e.data;
        }
    }

    //Identity filter to remove empty entries.
    return ret.flatMap(x => x.split("\n")).map(x => x.trim()).filter(x => x);
}

export class LynxchanAccessor implements ThreadAccessor {
    public getPostText(id: string) {
        return extractText([...document.getElementById(id).querySelector(".divMessage").childNodes as any]);
    }

    public getPostImageURL(id: string, nth: number) {
        return (document.getElementById(id).querySelectorAll(".nameLink")[nth] as HTMLAnchorElement).href;
    }
}