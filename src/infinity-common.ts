import { VichanAccessor } from './vichan-common';

const extractText = (elements: any[]) => {
    let ret: string[] = [];
    for(const e of elements) {
        if(e.classList.contains('empty')) {
            continue;
        } else if(e.classList.contains('ltr')) {
            const containedElement = e.childNodes[0];
            if(containedElement.tagName === 'A') {
                if(!(containedElement.innerText || "").startsWith('>>'))
                    ret.push(e.innerText);
            } else {
                ret.push(e.data || e.innerText);
            }
        }
    }

    return ret;
}

export class InfinityAccessor extends VichanAccessor {
    public getPostText(id: string): string[] {
        return extractText([...this.getPostContainer(id).querySelector('.body').childNodes as any]);
    }
}