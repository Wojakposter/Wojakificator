// ==UserScript==
// @name         Bunkersoy
// @namespace    http://4chan.org
// @version      1.8.1
// @description  Paste a post into a crying soyjak image
// @author       (You)
// @source       https://pastebin.com/raw/zXPh5mgQ
// @include      https://bunkerchan.xyz/*/res/*
// @grant        none
// ==/UserScript==

import dataUri from 'data-uri.macro'

(function() {
    'use strict';
    const options = {
        "Soyjack": dataUri("./img/soyjack.jpeg"),
        "Soyjack2": dataUri("./img/soyjack2.png"),
        "Soyjack3": dataUri("./img/soyjack3.jpeg"),
        "Soyjack4": dataUri("./img/soyjack4.png"),
        "Soyjack5": dataUri("./img/soyjack5.jpeg"),
        "Soyjack6": dataUri("./img/soyjack6.jpeg"),
        "Soyjack7": dataUri("./img/soyjack7.png"),
        "Soyjack8": dataUri("./img/soyjack8.png"),
        "Soyjack9": dataUri("./img/soyjack9.jpeg"),
        "Soyjack10": dataUri("./img/soyjack10.png"),
        "ChadWojak": dataUri("./img/chadwojak.png"),
        "Gigachad": dataUri("./img/gigachad.jpeg"),
        "Gigachad2": dataUri("./img/gigachad2.jpeg"),
        "PointingFingers": dataUri("./img/pointingfingers.png"),
        "Pink": dataUri("./img/pink.png"),
        "Grace": dataUri("./img/grace.png"),
        "Doomer": dataUri("./img/doomer.jpeg"),
        "PorkyCrying": dataUri("./img/porkycrying.png"),
        "PorkySoy": dataUri("./img/porkysoy.png"),
        "PorkyScared": dataUri("./img/porkyscared.png"),
        "PorkyMad": dataUri("./img/porkymad.png"),
        "PorkyNPC": dataUri("./img/porkynpc.png"),
        "Marx": dataUri("./img/marx.jpeg"),
        "Lenin": dataUri("./img/lenin.png"),
        "Trotsky": dataUri("./img/trotsky.png"),
        "Jannie": dataUri("./img/jannie.png"),
        "Jannie2": dataUri("./img/jannie2.png"),
        "4cuck": dataUri("./img/4cuck.png"),
        "Plebbit": dataUri("./img/plebbit.jpeg"),
        "BasedPepe": dataUri("./img/basedpepe.jpeg"),
        "Pajeet": dataUri("./img/pajeet.png"),
        "Lincuck": dataUri("./img/lincuck.png"),
        "Soymer": dataUri("./img/soymer.png"),
        "Pseud": dataUri("./img/pseud.jpeg"),
        "Fed": dataUri("./img/fed.png"),
        "NPCBrainlet": dataUri("./img/npcbrainlet.jpeg"),
        "SoyNPC": dataUri("./img/soynpc.png"),
        "Hitler": dataUri("./img/hitler.jpeg"),
        "Nazi": dataUri("./img/nazi.png"),
        "Nazi2": dataUri("./img/nazi2.png"),
        "Jew": dataUri("./img/jew.jpeg"),
        "Brainlet": dataUri("./img/brainlet.jpeg"),
        "Brainlet2": dataUri("./img/brainlet2.jpeg")
    }
    const speechBubbleDataURL = dataUri("./img/speechbubble.png")
    const quoteGreenColor = '#789922';
    const quoteOrangeColor = '#FF8C00';
    const bgColor = '#fff';
    const maxScaledImageWidth = 538;
    const maxScaledImageHeight = 621;
    const fontSize = 48;
    const fontName = 'arial';
    const cutOffWord = (context, word, maxWidth) => {
        if(context.measureText(word).width > maxWidth) {
            let ret = "";
            for(let c of word) {
                let testWord = ret + c;
                if(context.measureText(testWord + "...").width > maxWidth) {
                    break;
                }
                ret = testWord;
            }

            return ret + "...";
        }
        return word;
    }

    const wrapText = (context, lines, maxWidth) => {
        let ret = [];
        for(const line of lines) {
            if(context.measureText(line).width > maxWidth) {
                ret.push(line.trim().split(" ").map(w => cutOffWord(context, w, maxWidth)).reduce((wrapedLine, word) => {
                    let testLine = wrapedLine + ' ' + word;
                    if(context.measureText(testLine).width > maxWidth) {
                        ret.push(wrapedLine);
                        return word;
                    }
                    return testLine;
                }));
            } else {
                ret.push(line);
            }
        }
        return ret;
    }

    const writeToCanvas = (context, lines, x, y, textHeight) => {
        for(const line of lines) {
            if(line.startsWith(">")) {
                context.fillStyle = quoteGreenColor;
            } else if(line.startsWith("<")) {
                context.fillStyle = quoteOrangeColor;
            }
            context.fillText(line, x, y);
            y += textHeight;
        }
    }

    const generateTextWojak = postText => {
        const soyType = document.getElementById("soyjakSelector").value;
        const canvas = document.createElement('canvas');
        return loadAsImage(options[soyType]).then(img => {
            canvas.width = img.width;
            canvas.height = img.height + 100;
            const ctx = canvas.getContext('2d');
            const font = fontSize + 'px ' + fontName;

            ctx.font = font;
            const lines = wrapText(ctx, postText, img.width);
            canvas.height += lines.length * fontSize;

            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = font;
            writeToCanvas(ctx, lines, 0, img.height + 100, fontSize);

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0);
            return canvasToFile(canvas);
        });
    }

    const memeficate = (array, seetheMode) => {
        let firstTextNode = true;
        return array.map(e => {
            if(e.startsWith(">") || e.startsWith("http://") || e.startsWith("https://")) {
                return ">" + e;
            } else if(e.startsWith("<")) {
                return "<" + e;
            } else {
                let ret = ">";
                if(firstTextNode && seetheMode) {
                    ret += "NOOOOO!! ";
                    firstTextNode = false;
                }
                ret += seetheMode ? e.toUpperCase().replace(/\.+$/, "") + "!!" : e;
                return ret;
            }
        });
    }

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

    const getPostText = id => {
        const seetheMode = document.getElementById("seetheMode").checked;
        return memeficate(extractText([...document.getElementById(id).querySelector(".divMessage").childNodes]
                                        .filter(n => !(n.className || "").split(" ").includes("quoteLink"))), seetheMode);
    };

    const centerOffset = (partSize, wholeSize) => {
        return Math.floor((wholeSize - partSize) / 2);
    }

    const getPostImageURL = (id, nth) => {
        return document.getElementById(id).querySelectorAll(".nameLink")[nth].href;
    }

    const generateImageWojak = postImageURL => {
        const soyType = document.getElementById("soyjakSelector").value;
        const canvas = document.createElement("canvas");
        return Promise.all([options[soyType], speechBubbleDataURL, postImageURL].map(loadAsImage)).then(args => {
            const wojak = args[0];
            const speechBubble = args[1];
            const postImage = args[2];

            canvas.width = wojak.width + speechBubble.width;
            canvas.height = Math.max(wojak.height, speechBubble.height);
            
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(wojak, 0, canvas.height - wojak.height);
            ctx.drawImage(speechBubble, wojak.width, canvas.height - speechBubble.height);

            const scaledWidth = Math.min(postImage.width, maxScaledImageWidth);
            const scaledHeight = Math.min(postImage.height, maxScaledImageHeight);
            ctx.drawImage(postImage, wojak.width + 80 + centerOffset(scaledWidth, maxScaledImageWidth),
                                     (canvas.height - speechBubble.height) + 50 + centerOffset(scaledHeight, maxScaledImageHeight),
                                     scaledWidth, scaledHeight);
            return canvasToFile(canvas);
        }).catch(reason => alert("Something's fucked: " + reason));
    }

    const getFirstVideoFrame = videoURL => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        video.muted = true;
        video.autoplay = true;
        video.src = videoURL;
        return new Promise((resolve, reject) => {
            video.onloadeddata = function() {
                canvas.height = this.videoHeight;
                canvas.width = this.videoWidth;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(this, 0, 0);
                
                this.remove();
                resolve(loadAsImage(canvas.toDataURL()));
            }
            video.onerror = () => reject("Error while loading " + videoURL);
        });
    }

    const loadAsImage = uri => {
        if(uri.endsWith(".webm") || uri.endsWith(".mp4")) {
            return getFirstVideoFrame(uri);
        }
        const image = new Image();
        image.src = uri;
        return new Promise((resolve, reject) => {
            image.onload = function() {
                resolve(this);
            }
            image.onerror = () => reject("Error while loading " + uri);
        });
    }

    const canvasToFile = canvas => {
        return new Promise(resolve => canvas.toBlob(blob => resolve(new File([blob], "(you).png", {type: "image/png"}))));
    }

    const addGeneratedImage = (generatedWojak, id) => {
        postCommon.addSelectedFile(generatedWojak);
        qr.showQr(id);
        if(document.getElementById("autoReply").checked) {
            document.getElementById("fieldMessage").value = ">>" + id;
            thread.postReply();
        }
    }

    const addWojakifyButtons = () => {
        document.querySelectorAll(".postInfo, .opHead").forEach(postInfo => {
            if(postInfo.querySelector(".wojakify") === null && postInfo.closest(".quoteTooltip") === null) {
                const id = postInfo.querySelector(".linkQuote").innerText;
                const button = createWojakifyButton("wojakify", "Wojakify", () => generateTextWojak(getPostText(id)).then(wojak => addGeneratedImage(wojak, id)));
                postInfo.insertBefore(button, postInfo.childNodes[0]);
                (postInfo.classList.contains("opHead") ? postInfo.previousElementSibling : postInfo.nextElementSibling.nextElementSibling).querySelectorAll(".uploadDetails").forEach((uploadInfo, i) => {
                    const imageButton = createWojakifyButton("wojakify-image", "Wojakify Image", () => generateImageWojak(getPostImageURL(id, i)).then(wojak => addGeneratedImage(wojak, id)));
                    uploadInfo.insertBefore(imageButton, uploadInfo.childNodes[0]);
                });
            }
        });
    };

    const createWojakifyButton = (buttonClass, name, callback) => {
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

    const createCheckbox = (id, name, initialState) => {
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

    const createSelect = (id, opts) => {
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

    let wojakSelector = createSelect("soyjakSelector", options);
    const header = document.getElementById("threadHeader");
    const navOptions = document.getElementById("navOptionsSpan");
    [wojakSelector, ...createCheckbox("seetheMode", "Seethe Mode"), ...createCheckbox("autoReply", "Auto Reply")].forEach(e => header.insertBefore(e, navOptions));

    addWojakifyButtons();
    setInterval(addWojakifyButtons, 5000);
})();
