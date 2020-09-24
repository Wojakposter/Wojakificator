import { generateImageWojak, generateTextWojak } from './generator';
import { memeficate } from './textUtil'
import options from './options'
import { createCheckbox, createSelect, createWojakifyButton, createPreviewImage } from './ui'

export interface UserInterfaceContainer {
    sojakSelector: HTMLSelectElement;
    imageMode: HTMLInputElement;
    seetheMode: HTMLInputElement;
    preview: HTMLInputElement;
    autoReply: HTMLInputElement;
}
declare class script_settings {
    constructor(arg: string);
    get(name: string, defaultValue: any): any
}
declare function citeReply(id: string): boolean;
declare function highlightReply(id: string);
declare function _(arg: string): string;

export class TinyboardPlatformHandler implements UserInterfaceContainer {
    declare recentWojak: File;

    declare sojakSelector: HTMLSelectElement;
    declare imageMode: HTMLInputElement;
    declare seetheMode: HTMLInputElement;
    declare preview: HTMLInputElement;
    declare autoReply: HTMLInputElement;

    declare accessor: TinyboardAccessor;

    declare boundOnWojakify: (id: string) => void;

    constructor(ui: UserInterfaceContainer, accessor: TinyboardAccessor) {
        Object.assign(this, ui);
        this.accessor = accessor;
        this.recentWojak = null;
        this.boundOnWojakify = this.onWojakify.bind(this);
    }

    protected handleGenerateWojak(wojak: File, id: string) {
        this.recentWojak = wojak;
        citeReply(id);
        if(this.preview.checked)
            this.accessor.getPostBody(id).parentElement.appendChild(createPreviewImage(wojak));
        if(this.autoReply.checked) {
            document.getElementsByName('post')[1].click();
        }
    }

    private onWojakify(id: string) {
        const selectedWojak = options[this.sojakSelector.value];
        (this.imageMode.checked ? generateImageWojak(this.accessor.getPostImageURL(id), selectedWojak)
                                : generateTextWojak(memeficate(this.accessor.getPostText(id), this.seetheMode.checked), selectedWojak)).then(wojak => this.handleGenerateWojak(wojak, id))
                                                                                                                                        .catch(reason => alert("Something's fucked: " + reason));
    }

    public addWojakifyButtons() {
        document.querySelector('[id^="thread_"]').querySelectorAll('.intro').forEach(header => {
            if(header.querySelector(".wojakify") === null)
                header.insertBefore(createWojakifyButton('wojakify', 'Wojakify', this.boundOnWojakify, header.id), header.childNodes[0])
        });
    }

    public setupPostingHandler() {
        //Cleanup 
        $('form[name="post"]').off('submit');
        $(window).off('quick-reply')
        $("form#quick-reply").off('submit');
        //Patch posting
        const _this = this;
        const settings = new script_settings("ajax");

        const setup_form = (_form: JQuery<HTMLElement>) => {
            _form.submit(function(this: HTMLFormElement) {
                var form = this;
                var submit_txt = $(this).find('input[type="submit"]').val() as string;
                if (window.FormData === undefined)
                    return true;
                /** @type {!FormData} */
                var formData = new FormData(this);
                formData.append("json_response", "1");
                formData.append("post", submit_txt);
                //Set recent wojak
                formData.set('file', _this.recentWojak);
                /**
                 * @param {!Object} e
                 * @return {undefined}
                 */
                var updateProgress = function(e) {
                    var percentage;
                    if (e.position === undefined) {
                        /** @type {number} */
                        percentage = Math.round(e.loaded * 100 / e.total);
                    } else {
                        /** @type {number} */
                        percentage = Math.round(e.position * 100 / e.total);
                    }
                    $(form).find('input[type="submit"]').val(_("Posting... (#%)").replace("#", percentage));
                };
                $.ajax(this.action, {
                type : "POST",
                xhr : function() {
                    var xhr = $.ajaxSettings.xhr();
                    if (xhr.upload) {
                        xhr.upload.addEventListener("progress", updateProgress, false);
                    }
                    return xhr;
                },
                success : function(post_response) {
                    if (post_response.error) {
                        if (post_response.banned) {
                            /** @type {boolean} */
                            $(form).find('input[type="submit"]').each(function() {
                                var $replacement = $('<input type="hidden">');
                                $replacement.attr("name", $(this).attr("name"));
                                $replacement.val(submit_txt);
                                $(this).after($replacement).replaceWith($('<input type="button">').val(submit_txt));
                            });
                            $(form).submit();
                        } else {
                            alert(post_response.error);
                            $(form).find('input[type="submit"]').val(submit_txt);
                            $(form).find('input[type="submit"]').removeAttr("disabled");
                        }
                    } else {
                        if (post_response.redirect && post_response.id) {
                            if (!$(form).find('input[name="thread"]').length || !settings.get("always_noko_replies", true) && !post_response.noko) {
                                document.location = post_response.redirect;
                            } else {
                                $.ajax(document.location.href, {
                                    success : function(data) {
                                        $(data).find("div.post.reply").each(function() {
                                            var id = $(this).attr("id");
                                            if ($("#" + id).length == 0) {
                                            $(this).insertAfter($("div.post:last").next()).after('<br class="clear">');
                                            $(document).trigger("new_post", this);
                                            }
                                        });
                                        highlightReply(post_response.id);
                                        if ($(form).attr("qr") !== "true") {
                                            window.location.hash = post_response.id;
                                            $(window).scrollTop($("#reply_" + post_response.id).offset().top);
                                        }
                                        $(form).find('input[type="submit"]').val(submit_txt);
                                        $(form).find('input[type="submit"]').removeAttr("disabled");
                                        $(form).find('input[name="subject"],input[name="file_url"], textarea[name="body"],input[type="file"]').val("").change();
                                    },
                                    cache : false,
                                    contentType : false,
                                    processData : false,
                                    dataType: 'html'
                                });
                            }
                            $(form).find('input[type="submit"]').val(_("Posted!"));
                        } else {
                            alert(_("An unknown error occured when posting!"));
                            $(form).find('input[type="submit"]').val(submit_txt);
                            $(form).find('input[type="submit"]').removeAttr("disabled");
                        }
                    }
                },
                error : function(xhr, status, er) {
                    $(form).find('input[type="submit"]').each(function() {
                    var $replacement = $('<input type="hidden">');
                    $replacement.attr("name", $(this).attr("name"));
                    $replacement.val(submit_txt);
                    $(this).after($replacement).replaceWith($('<input type="button">').val(submit_txt));
                    });
                    $(form).submit();
                },
                data : formData,
                cache : false,
                contentType : false,
                processData : false,
                dataType: 'json'
                });
                $(form).find('input[type="submit"]').val(_("Posting..."));
                $(form).find('input[type="submit"]').attr("disabled", 'true');
                return false;
            });
        };
        setup_form($('form[name="post"]'));
        $(window).on("quick-reply", () => setup_form($("form#quick-reply")));
    }
}


export const extractText = (elements: any[]) => {
    const ret: string[] = [];
    let currentLine = ''
    for(const e of elements) {
        if(e.tagName === 'A') {
            if(!e.innerText.startsWith(">>"))
                currentLine += e.innerText;
        } else if(e.tagName === 'SPAN') {
            if(e.className === 'quote' || e.className === 'heading' || e.className === 'spoiler') {
                if(currentLine === '') {
                    ret.push(e.innerText);
                } else {
                    ret.push(currentLine);
                    ret.push(e.innerText);
                    currentLine = '';
                }
            }
        } else if(e.tagName === 'STRONG' || e.tagName === 'EM' || e.tagName === 'CODE') {
            currentLine += e.innerText;
        } else if(e.tagName === 'PRE' || e.tagName === 'SMALL') {
            continue;
        } else if(e.tagName === 'BR') {
            if(currentLine !== '') {
                ret.push(currentLine);
                currentLine = '';
            }
        } else {
            currentLine += e.data;
        }
    }
    if(currentLine !== '')
        ret.push(currentLine);
    return ret.map(x => x.trim()).filter(x => x);
}

export class TinyboardAccessor {
    public getPostContainer(id: string) {
        return document.getElementById('thread_' + id) || document.getElementById('reply_' + id);
    }

    public getPostBody(id: string) {
        return this.getPostContainer(id).querySelector('.body');
    }

    public getPostText(id: string) {
        return extractText([...this.getPostBody(id).childNodes as any]);
    }

    public getPostImageURL(id: string, nth?: number) {
        const imageContainer = this.getPostContainer(id);
        if(imageContainer.id.startsWith('thread_')) {
            return (imageContainer.children[1] as HTMLAnchorElement).href;
        } else {
            if(imageContainer.children.length < 3)
                return 'none';
            return (imageContainer.children[2] as HTMLAnchorElement).href;
        }
    }
}

export const createUI = (): UserInterfaceContainer => {
    const wojakSelector = createSelect("soyjakSelector", options);
    const imageMode = createCheckbox('imageMode', "Image Mode");
    const seethMode = createCheckbox("seetheMode", "Seethe Mode");
    const autoReply = createCheckbox("autoReply", "Auto Reply");
    const preview = createCheckbox('preview', 'Preview', true);

    const header = document.querySelector('.boardlist');
    [wojakSelector, ...seethMode, ...imageMode, ...autoReply, ...preview].forEach(e => header.appendChild(e));
    return {
        sojakSelector: wojakSelector,
        imageMode: imageMode[1],
        seetheMode: seethMode[1],
        autoReply: autoReply[1],
        preview: preview[1]
    }
}