export const createWojakifyButton = (buttonClass: string, name: string, callback: (...args: any[]) => void, ...args: any[]) => {
    const button = document.createElement('button');
    button.style.cursor = 'pointer';
    button.style.margin = '5px';
    button.textContent = name;
    button.classList.add(buttonClass);
    //button.href = "#";
    button.onclick = (e) => {
        e.preventDefault();
        callback(...args);
    };
    return button;
};

export const createCheckbox = (id: string, name: string, initialState = false): [HTMLLabelElement, HTMLInputElement] => {
    const isCheckedCookie = localStorage.getItem(id + "Enabled");
    if(isCheckedCookie !== null)
        initialState = isCheckedCookie === "true";
    let label = document.createElement("label");
    let checkbox = document.createElement("input");
    
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.name = id;
    checkbox.checked = initialState;
    checkbox.onclick = function(this: HTMLInputElement) {
        localStorage.setItem(this.id + "Enabled", this.checked.toString());
    };
    
    label.htmlFor = id;
    label.innerHTML = name;
    //Make label unselectable;
    label.style.userSelect = 'none';
    return [label, checkbox];
}

export const createSelect = (id: string, opts: object) => {
    let selector = document.createElement("select");
    selector.id = id;
    selector.style.marginLeft = "10px";
    selector.style.marginRight = "5px";
    selector.style.fontSize = "100%";
    for(const key of Object.keys(opts)) {
        let option = document.createElement("option");
        option.textContent = key;
        option.value = key;
        selector.appendChild(option);
    }
    selector.oninput = function(this: HTMLInputElement) {
        localStorage.setItem(this.id + "Value", this.value);
    }

    const previousSelection = localStorage.getItem(id + "Value");
    if(previousSelection !== null) {
        if(opts[previousSelection] === undefined) {
            localStorage.removeItem(id + "Value");
        } else {
            selector.value = previousSelection;
        }
    }

    return selector;
}

//#if _CUSTOM_PREVIEW
export const createPreviewImage = (file: File) => {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onclick = function(this: HTMLImageElement) {
        URL.revokeObjectURL(this.src);
        this.remove();
    }
    return image;
}
//#endif