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

export const wrapText = (context, lines, maxWidth) => {
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

export const memeficate = (array, seetheMode) => {
    let firstTextNode = true;
    return array.map(e => {
        if(e.startsWith(">") || e.startsWith("http://") || e.startsWith("https://")) {
            return ">" + e;
        }
        //#if _ORANGE_QUOTE
        else if(e.startsWith("<")) {
            return "<" + e;
        }
        //#endif
        else {
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