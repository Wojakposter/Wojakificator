export const createWojakifyButton = (buttonClass, name, callback) => {
    const button = document.createElement('button');
    button.style = 'cursor: pointer; margin: 5px';
    button.textContent = name;
    button.classList.add(buttonClass);
    //button.href = "#";
    button.onclick = (e) => {
        e.preventDefault();
        callback();
    };
    return button;
};

export const createCheckbox = (id, name, initialState) => {
    initialState = initialState === true;
    const isCheckedCookie = localStorage.getItem(id + "Enabled");
    if(isCheckedCookie !== undefined)
        initialState = isCheckedCookie === "true";
    let label = document.createElement("label");
    let checkbox = document.createElement("input");
    
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.name = id;
    checkbox.checked = initialState;
    checkbox.onclick = function() {
        localStorage.setItem(this.id + "Enabled", this.checked);
    };
    
    label.for = id;
    label.innerHTML = name;
    label.onclick = () => document.getElementById(id).click();
    //Make label unselectable;
    label.style = `-webkit-touch-callout: none;
-webkit-user-select: none;
-khtml-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;`;
    return [label, checkbox];
}

export const createSelect = (id, opts) => {
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
    selector.oninput = function() {
        localStorage.setItem(this.id + "Value", this.value);
    }

    const previousSelection = localStorage.getItem(id + "Value");
    if(previousSelection !== undefined) {
        if(opts[previousSelection] === undefined) {
            localStorage.removeItem(id + "Value");
        } else {
            selector.value = previousSelection;
        }
    }

    return selector;
}

//#if _CUSTOM_PREVIEW
export const createPreviewImage = file => {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onclick = function() {
        URL.revokeObjectURL(this.src);
        this.remove();
    }
    return image;
}
//#endif