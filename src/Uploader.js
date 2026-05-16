'use_strict';

class Uploader {

    #Form;

    constructor(form) {

        this.#Form = form;

    }

    async handleSubmitEvent(callback) {

        const response = await this.#uploadData();
        callback(response);

        return this;

    }

    #getFormData() {

        const data = new FormData();
        data.append("converter_mode", this.#Form.mode.value);
        data.append("width", this.#Form.width.value);
        data.append("image", this.#Form.file());

        return data;

    }

    #checkFileSize() {

        if (!this.#Form.file()) {
            return {"error": true, "message": "Image data missing. Please upload an image."};
        }

        if (this.#Form.file().size > (5 * 1048576)) {
            return {"error": true, "message": "Image too large. Size limit of 5MB."};
        }

        return {"error": false};

    }

    async #uploadData() {

        this.#Form.submit.setAttribute("aria-disabled", "true");
        const error = this.#checkFileSize();

        if (error.error === true) {
            this.#Form.submit.setAttribute("aria-disabled", "false");
            return error;
        }

        const buttonTxt = this.#Form.submit.value;
        this.#Form.submit.value = this.#changeButtonValue();
        const url = new URL(window.location.href);
        const pathname = url.pathname === "/" ? url.pathname : `${url.pathname}/`;
        const data = this.#getFormData();
        const response = await fetch(`${url.origin}${pathname}php/convert.php`, {
            method: "POST",
            body: data,
        }).then(async response => {
                try {
                    const text = await response.text();
                    return JSON.parse(text);
                } catch (e) {
                    console.error("sometimes an image that should be fine maxes out the memory allocated to PHP and i can't figure out why this is happening. it seems related to how many transparent pixels an image has, but i don't know why that would matter.");
                    return {
                        "error": true, 
                        "message": "The server really hated that for some reason and is refusing to process it or explain why. Maybe try a different image?"
                    };
                }
            }
        );

        await new Promise(res => setTimeout(res, 1500));

        this.#Form.submit.value = buttonTxt;
        if (response.error === false) this.#Form.submit.setAttribute("aria-disabled", "false");

        return response;

    }

    #changeButtonValue() {

        const values = [
            "What did HTML ever do to you?",
            "Are you okay?",
            "Do you need to talk?",
            "You belong in prison.",
            "This serves no practical purpose.",
            "Who hurt you?",
            "...Seriously?",
            "Did an HTML document torch your house or something?",
            "Were you bullied by a div in high school?",
            "Please don't actually use code this anywhere.",
            "I wouldn't open the dev tools if I were you."
        ];

        return values[Math.floor(Math.random() * values.length)];

    }

}

export default Uploader;
