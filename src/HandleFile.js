'use_strict';

class HandleFile {

    #button;
    #label;
    #input;
    #filename;
    file;

    static init() {

        const handler = new HandleFile();
        handler.#button = document.querySelector(`label[for="file"] > button`);
        handler.#label = document.querySelector(`label[for="file"]`);
        handler.#input = document.querySelector(`input[type="file"]`);
        handler.#filename = document.querySelector(`label[for="file"] > span`)
        handler.#handleClickEvent();
        handler.#handleChangeEvent();

        return handler;

    }

    #handleClickEvent() {
        
        this.#button.addEventListener("click", e => {
            e.preventDefault();
            this.#label.click();
        });
        this.#label.addEventListener("click", e => e.stopPropagation());

    }

    #handleChangeEvent() {

        this.#input.addEventListener("change", e => {
            e.preventDefault();
            const text = document.createTextNode(e.target.files[0].name);
            this.file = e.target.files[0];
            this.#filename.innerHTML = "";
            this.#filename.append(text);
        });

    }

}

export default HandleFile;
