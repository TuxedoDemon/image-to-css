'use strict';

import JSONBuilder from './JSONBuilder.js';

class TextTools {

    static addTxt(txtNode) {

        return {taginfo : null, txt : txtNode};

    }

    static #isValidLink(urlTxt) {

        try {
            new URL(urlTxt);
            return true;
        } catch (e) {
            return false;
        }

    }

    static addLink(urlTxt, txtNode = null, linkAttr = []) {

        if (!TextTools.#isValidLink(urlTxt)) return;
        const url = new URL(urlTxt);
        if (txtNode === null) txtNode = url.href;

        linkAttr.push({type : "href", value : url.href});

        const a = new JSONBuilder()
            .setTagName("a")
            .setAttributes(...linkAttr);

        return {taginfo : a, txt : txtNode};

    }

    static addSubTxt(txtNode) {

        const sub = new JSONBuilder()
            .setTagName("sub");

        return {taginfo : sub, txt : txtNode};
    
    }

    static addSupTxt(txtNode) {

        const sup = new JSONBuilder()
            .setTagName("sup");

        return {taginfo : sup, txt : txtNode};
    
    }

    static addUnderlinedTxt(txtNode) {

        const u = new JSONBuilder()
            .setTagName("u");

        return {taginfo : u, txt : txtNode};
    
    }

    static addSrikeThroughTxt(txtNode) {

        const s = new JSONBuilder()
            .setTagName("s");

        return {taginfo : s, txt : txtNode};
    
    }

    static addBoldTxt(txtNode) {

        const bold = new JSONBuilder()
            .setTagName("strong");

        return {taginfo : bold, txt : txtNode};
    
    }

    static addItalicTxt(txtNode) {

        const em = new JSONBuilder()
            .setTagName("em");

        return {taginfo : em, txt : txtNode};

    }

    static addColoredText(color, txtNode) {

        const rgb = new JSONBuilder()
            .setTagName("span")
            .setInlineStyling(`color: ${color};`);

        return {taginfo : rgb, txt : txtNode};

    }

    static addTxtChildren(parent, ...children) {

        if ([undefined, null].includes(parent.taginfo)) return parent;
        if ([undefined, null].includes(parent.taginfo.JSON)) return parent;
        if (parent.taginfo.JSON.txtnode === null) parent.taginfo.JSON.txtnode = [];
        
        children.forEach(child => {
            if ([undefined, null].includes(child.txt)) return;
            parent.taginfo.JSON.txtnode.push(child);
        });

        return parent;

    }

}

export default TextTools;
