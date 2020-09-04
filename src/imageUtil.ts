//#if _BYPASS_CORS
declare function GM_xmlhttpRequest(details: object): void

const fetchAsObjectURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            anonymous: true,
            responseType: "blob",
            onload: r => resolve(URL.createObjectURL(r.response)),
            onerror: () => reject("Unable to download " + url),
        });
    });
}

const bypassCORS = function<T>(func: (someUrl: string) => Promise<T>, fetchedURL: string) {
    return fetchAsObjectURL(fetchedURL).then(url => Promise.all([func(url), url])).then((args: [T, string]) => {
        URL.revokeObjectURL(args[1]);
        return args[0];
    });
}
//#endif

const getFirstVideoFrame = (videoURL: string): Promise<string> => {
    //#if _BYPASS_CORS
    if(videoURL.startsWith("http://") || videoURL.startsWith("https://")) {
        return bypassCORS(getFirstVideoFrame, videoURL);
    }
    //#endif
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    video.muted = true;
    video.autoplay = true;
    video.src = videoURL;
    return new Promise((resolve, reject) => {
        video.onloadeddata = function(this: HTMLVideoElement) {
            canvas.height = this.videoHeight;
            canvas.width = this.videoWidth;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);
            
            this.remove();
            resolve(canvas.toDataURL());
        }
        video.onerror = () => reject("Error while loading " + videoURL);
    });
}

export const loadAsImage = (uri: string): Promise<HTMLImageElement> => {
    if(uri.endsWith(".webm") || uri.endsWith(".mp4")) {
        return getFirstVideoFrame(uri).then(loadAsImage);
    }
    //#if _BYPASS_CORS
    if(uri.startsWith("http://") || uri.startsWith("https://")) {
        return bypassCORS(loadAsImage, uri);
    }
    //#endif
    const image = new Image();
    image.src = uri;
    return new Promise((resolve, reject) => {
        image.onload = function(this: HTMLImageElement) {
            resolve(this);
        }
        image.onerror = () => reject("Error while loading " + uri);
    });
}