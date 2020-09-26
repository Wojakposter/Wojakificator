import options from '../options'
import * as constants from '../constants'
import { generateImageWojak, generateTextWojak } from '../generator'
import { memeficate } from '../textUtil'
import { createWojakifyButton, createCheckbox, createSelect, PreviewManager } from '../ui';

import "core-js/features/array/flat-map";

unsafeWindow.recentSoyjack = null;

const extractText = n => {
    if (n.data !== undefined) return n.data;
    //Ignore WBR, embed links and spans without classes, they will be removed later.
    if (n.tagName === "SPAN" || n.tagName === "WBR" || n.tagName == "S" || n.dataset.type === "yt") return n;
};

const removeEmbeddedTags = nodes => {
    let ret = [];
    for (let i = 0; i < nodes.length; ++i) {
        if(nodes[i].tagName === "WBR") {
            ret[ret.length - 1] += nodes[++i];
        } else if(nodes[i].tagName === "SPAN" && nodes[i].className !== "quote" || nodes[i].tagName === "S") {
            ret[ret.length - 1] += nodes[i].innerText;
        } else if(nodes[i].className === "quote") {
            ret.push(nodes[i].innerText);
        } else if(nodes[i].tagName === "A") {
            ret.pop();
            ++i;
        } else {
            ret.push(nodes[i]);
        }
    }
    return ret;
}

const getPostText = (id, seetheMode) => {
    return memeficate(removeEmbeddedTags([...document.getElementById("m" + id).childNodes]
                               .filter(n => !(n.className || "").split(" ").includes("quotelink") && n.tagName !== "BR")
                               .flatMap(extractText).filter(n => n !== undefined)), seetheMode);
};

const getPostImageURL = id =>  {
    const imageURLContainer = document.getElementById("fT" + id);
    return imageURLContainer === null ? "none" : imageURLContainer.children[0].href;
}

const checkRecaptchaCompletion = () => {
    try {
        return grecaptcha.getResponse().length !== 0;
    } catch(e) {
        return false;
    }
}

const onWojakify = id => {
    const seetheMode = document.getElementById("seetheMode").checked;
    const imageMode = document.getElementById("imageMode").checked;
    const selectedWojakURI = options[document.getElementById('soyjackSelector').value];
    (imageMode ? generateImageWojak(getPostImageURL(id), selectedWojakURI) : generateTextWojak(getPostText(id, seetheMode), selectedWojakURI)).then(wojak => {
        unsafeWindow.recentSoyjack = wojak;
        if(document.getElementById("previewWojak").checked)
            previewManager.addWojak(wojak);
        if(document.getElementById("autoReply").checked) {
            //If quick reply window is closed, open it.
            if(QR.currentTid == null)
                QR.show(Main.tid);
            document.getElementsByName("com")[1].value = ">>" + id;
            if(unsafeWindow.passEnabled || checkRecaptchaCompletion()) {
                QR.submit();
            } else {
                QR.showPostError("In order to post the wojak, please complete the captcha and click 'Post'.");
            }
        }
    }).catch(reason => alert("Something's fucked: " + reason));
};

const addWojakifyButtons = () => {
    document.querySelectorAll(Main.hasMobileLayout ? ".postInfoM" : ".postInfo").forEach(postInfo => {
        if(postInfo.querySelector(".wojakify") === null) {
            const id = postInfo.querySelector(".postNum").children[1].innerText;
            const button = createWojakifyButton('wojakify', 'Wojakify', onWojakify, id);
            postInfo.insertBefore(button, postInfo.childNodes[0]);
        }
    });
}
const previewManager = new PreviewManager();
let wojakSelector = createSelect("soyjackSelector", options);
let container = Main.hasMobileLayout ? document.querySelectorAll('.navLinks.mobile')[1] : document.querySelector('.bottomCtrl') ;
[wojakSelector, ...createCheckbox("seetheMode", "Seethe Mode"),
                ...createCheckbox("imageMode", "Image Mode"),
                ...createCheckbox("previewWojak", "Preview", true, previewManager.handlePreviewCheckbox.bind(previewManager)),
                ...createCheckbox("autoReply", "Auto Reply", true)].forEach(e => container.appendChild(e));
previewManager.handlePreviewCheckbox(document.getElementById('previewWojak').checked);

addWojakifyButtons();
setInterval(addWojakifyButtons, 5000);

//Patch 4chan posting
unsafeWindow.QR.submit = function(e) {
    var t;
    QR.hidePostError();
    if(QR.presubmitChecks(e)) {
        QR.auto = false;
        QR.xhr = new XMLHttpRequest;
        QR.xhr.open("POST", document.forms.qrPost.action, true);
        QR.xhr.withCredentials = true;
        QR.xhr.upload.onprogress = function(e) {
            if(e.loaded >= e.total) {
                QR.btn.value = "100%";
            } else {
                QR.btn.value = (0 | e.loaded / e.total * 100) + "%";
            }
        };
        QR.xhr.onerror = function() {
            QR.xhr = null;
            QR.showPostError("Connection error.");
        };
        QR.xhr.onload = function() {
            var e;
            var t;
            var a;
            var i;
            var n;
            var o;
            var r;
            if(QR.xhr = null, QR.btn.value = "Post", 200 == this.status) {
                if(e = this.responseText.match(/"errmsg"[^>]*>(.*?)<\/span/)) {
                    return unsafeWindow.passEnabled && /4chan Pass/.test(e) ? QR.onPassError() : QR.resetCaptcha(), void QR.showPostError(e[1]);
                }
                if(i = this.responseText.match(/\x3c!-- thread:([0-9]+),no:([0-9]+) --\x3e/)) {
                    n = i[1];
                    o = i[2];
                    a = (t = $.id("qrFile")) && t.value;
                    QR.setPostTime();
                    if(Config.persistentQR) {
                        $.byName("com")[1].value = "";
                        if(t = $.byName("spoiler")[2]) {
                            t.checked = false;
                        }
                        QR.resetCaptcha();
                        if(a || QR.painterData) {
                            QR.resetFile();
                        }
                        QR.startCooldown();
                    } else {
                        QR.close();
                    }
                    if(Main.tid) {
                        if(Config.threadWatcher) {
                            ThreadWatcher.setLastRead(o, n);
                        }
                        QR.lastReplyId = +o;
                        Parser.trackedReplies[">>" + o] = 1;
                        Parser.saveTrackedReplies(n, Parser.trackedReplies);
                    } else {
                        (r = Parser.getTrackedReplies(Main.board, n) || {})[">>" + o] = 1;
                        Parser.saveTrackedReplies(n, r);
                    }
                    Parser.touchTrackedReplies(n);
                    UA.dispatchEvent("4chanQRPostSuccess", {
                        threadId : n,
                        postId : o
                    });
                }
                if(ThreadUpdater.enabled) {
                    setTimeout(ThreadUpdater.forceUpdate, 500);
                }
            } else {
                QR.showPostError("Error: " + this.status + " " + this.statusText);
            }
        };
        //MODIFIED
        t = new FormData(document.forms.qrPost);
        if(unsafeWindow.recentSoyjack !== null)
        {
            t.set("upfile", unsafeWindow.recentSoyjack);
            unsafeWindow.recentSoyjack = null;
        }
        previewManager.removeWojak();
        //MODIFIED END
        if(!(!t.entries || !t["delete"] || t.get("upfile") && t.get("upfile").size)) {
            t["delete"]("upfile");
        }
        if(QR.painterData) {
            QR.appendPainter(t);
            if(QR.replayBlob) {
                t.append("oe_replay", QR.replayBlob, "tegaki.tgkr");
            }
            t.append("oe_time", QR.painterTime);
            if(QR.painterSrc) {
                t.append("oe_src", QR.painterSrc);
            }
        }
        clearInterval(QR.pulse);
        QR.btn.value = "Sending";
        QR.xhr.send(t);
    }
}