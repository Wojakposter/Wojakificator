import { createWojakifyButton, createSelect, createCheckbox } from "./ui";
import { generateTextWojak, generateImageWojak } from "./generator";
import options from './options'
import { memeficate } from "./textUtil";

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

    constructor(ui: UserInterfaceContainer, accessor: ThreadAccessor) {
        Object.assign(this, ui);
        this.accessor = accessor;
    }

    protected handleWojakify(wojak: File, id: string) {
        postCommon.addSelectedFile(wojak);
        qr.showQr(id);
        if(this.autoReply.checked) {
            (document.getElementById("fieldMessage") as HTMLInputElement).value = ">>" + id;
            thread.postReply();
        }
    }

    protected createImageWojakifyButton(id: string, nth: number) {
        return createWojakifyButton('wojakify-image', 'Wojakify Image', () => {
            generateImageWojak(this.accessor.getPostImageURL(id, nth), options[this.sojakSelector.value]).then(wojak => this.handleWojakify(wojak, id));
        });
    }

    protected createTextWojakifyButton(id: string) {
        return createWojakifyButton('wojakify', 'Wojakify', () => {
            generateTextWojak(memeficate(this.accessor.getPostText(id), this.seetheMode.checked), options[this.sojakSelector.value]).then(wojak => this.handleWojakify(wojak, id));
        });
    }
    
    public addWojakifyButtons() {
        document.querySelectorAll(".postInfo, .opHead").forEach(postInfo => {
            if(postInfo.querySelector(".wojakify") === null && postInfo.closest(".quoteTooltip") === null) {
                const id = (postInfo.querySelector(".linkQuote") as HTMLAnchorElement).innerText;
                postInfo.insertBefore(this.createTextWojakifyButton(id), postInfo.childNodes[0]);
                (postInfo.classList.contains("opHead") ? postInfo.previousElementSibling : postInfo.nextElementSibling.nextElementSibling).querySelectorAll(".uploadDetails").forEach((uploadInfo, i) => {
                    uploadInfo.insertBefore(this.createImageWojakifyButton(id, i), uploadInfo.childNodes[0]);
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