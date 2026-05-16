'use strict';

class JSONReader {

            Collection = [];
            Element;

        constructor(json) {

            this.Element = this.#buildFormSections(json);

        }

    #makeElementTag(element, obj) {

        if(!obj.tag) return element;
        return (!obj.namespace) ? document.createElement(obj.tag) : document.createElementNS(obj.namespace, obj.tag);

    }

    #createElementClassList(element, obj) {

        if (obj.classlist) element.classList.add(...obj.classlist);

    }

    #setElementAttributes(element, obj) {

        obj.attributes?.forEach((attr) => {
            element.setAttribute(attr.type, attr.value);
        });

    }

    #setElementInlineStyle(element, obj) {

        if (!obj.styling || obj.styling.length === 0) return;
        const styling = [];

        obj.styling?.forEach((css) => {
            const check = css.length - 1;
            if (css.indexOf(";", check) !== check) css += ";";
            styling.push(`${css}`);
        });

        element.style.cssText = styling.join('');

    }

    #handleTxtNodes(element, obj) {

        obj.txtnode?.forEach((node) => {
            if ([null, undefined].includes(node.txt) || typeof node.txt !== "string") return;
            const txtnode = document.createTextNode(node.txt);
            const tag = (node.taginfo === null) ? null : this.#handleTxtTags([node.taginfo.JSON], txtnode);
            this.Collection.push(txtnode);
            element.appendChild(tag ?? txtnode);
        });

    }

    #createChildren(element, obj) {

        obj.children?.forEach((child) => {
            const node = this.#buildFormSections(child);
            element.appendChild(node);
        });

    }

    #handleTxtTags(node, txtnode){

        return this.#buildFormSections(node, txtnode);

    }

    #buildFormSections(json, txtnode = null) {

        let element; 

        json.forEach((obj) => {
            element = this.#makeElementTag(element, obj);
            if (txtnode) element.appendChild(txtnode);
            this.#setElementInlineStyle(element, obj);
            this.#createElementClassList(element, obj);
            this.#setElementAttributes(element, obj);
            this.#handleTxtNodes(element, obj);
            this.Collection.push(element);
            this.#createChildren(element, obj);
        });

        return element;

    }

}

export default JSONReader;
