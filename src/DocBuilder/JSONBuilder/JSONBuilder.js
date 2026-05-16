'use strict';

class JSONBuilder {

            JSON;

        constructor() {

            this.JSON = {
                tag : null,
                namespace : null,
                classlist : null,
                styling : null,
                attributes : null,
                txtnode : null,
                children : null,
            };

        }

    setTagName(tagname, namespace) {

        if (tagname) this.JSON.tag = tagname;
        if (namespace) this.JSON.namespace = namespace;

        return this;

    }

    setClassList(...classlist) {

        this.JSON.classlist = [];

        classlist.forEach(cl => (typeof cl === "string") && this.JSON.classlist.push(cl.trim()));

        return this;

    }

    setInlineStyling(...styles) {

        this.JSON.styling = [];

        styles.forEach(st => this.JSON.styling.push(st.trim(st)));

        return this;

    }

    setAttributes(...attr) {

        this.JSON.attributes = [];

        attr.forEach(obj => {
            if (!obj.type || obj.type === undefined) return;
            if (typeof obj.type === "string") {
                obj.value === null && (obj.value = "");
                this.JSON.attributes.push(obj);
            }
        });

        return this;

    }

    setTxtNodes(...text) {

        this.JSON.txtnode = [];
        text.forEach(txt => this.JSON.txtnode.push(txt));

        return this;
        
    }

    static addChildren(parent, ...children) {

        if (parent.JSON.children === null) parent.JSON.children = [];
        children.forEach(child => parent.JSON.children.push([child.JSON]));

        return parent;

    }
    
}

export default JSONBuilder;
