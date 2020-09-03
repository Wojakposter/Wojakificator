import options from '../options.js'
//Position constants just below options
import * as constants from '../constants'
import {generateTextWojak, generateImageWojak} from '../generator'
import {memeficate} from '../textUtil'
import * as ui from '../ui'

const extractText = elements => {
    const ret = [];
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
};

const parsePostText = elements => {
    //Filter to remove links to posts
    return extractText(elements.filter(n => !(n.className || "").split(" ").includes("quoteLink")));
}

const getPostText = id => parsePostText([...document.getElementById(id).querySelector(".divMessage").childNodes]);

const getPostImageURL = (id, nth) => {
    return document.getElementById(id).querySelectorAll(".nameLink")[nth].href;
}

const addImageToPost = (generated, id, isAutoReply) => {
    postCommon.addSelectedFile(generated);
    qr.showQr(id);
    if(isAutoReply) {
        document.getElementById("fieldMessage").value = ">>" + id;
        thread.postReply();
    }
}

const createWojakifyHandler = (wojakify, id, getWojakifyArg) => () => {
    const seetheMode = document.getElementById("seetheMode").checked === true;
    const autoReply = document.getElementById("autoReply").checked === true;
    wojakify(getWojakifyArg(seetheMode), options[document.getElementById('soyjakSelector').value]).then(wojak => addImageToPost(wojak, id, autoReply));
}

const addWojakifyButtons = () => {
    document.querySelectorAll(".postInfo, .opHead").forEach(postInfo => {
        if(postInfo.querySelector(".wojakify") === null && postInfo.closest(".quoteTooltip") === null) {
            const id = postInfo.querySelector(".linkQuote").innerText;
            const button = ui.createWojakifyButton("wojakify", "Wojakify", createWojakifyHandler(generateTextWojak, id, seetheMode => memeficate(getPostText(id), seetheMode)));
            postInfo.insertBefore(button, postInfo.childNodes[0]);
            (postInfo.classList.contains("opHead") ? postInfo.previousElementSibling : postInfo.nextElementSibling.nextElementSibling).querySelectorAll(".uploadDetails").forEach((uploadInfo, i) => {
                const imageButton = ui.createWojakifyButton("wojakify-image", "Wojakify Image", createWojakifyHandler(generateImageWojak, id, () => getPostImageURL(id, i)));
                uploadInfo.insertBefore(imageButton, uploadInfo.childNodes[0]);
            });
        }
    });
};

let wojakSelector = ui.createSelect("soyjakSelector", options);
const header = document.getElementById("threadHeader");
const navOptions = document.getElementById("navOptionsSpan");
[wojakSelector, ...ui.createCheckbox("seetheMode", "Seethe Mode"), ...ui.createCheckbox("autoReply", "Auto Reply")].forEach(e => header.insertBefore(e, navOptions));

addWojakifyButtons();
setInterval(addWojakifyButtons, 5000);