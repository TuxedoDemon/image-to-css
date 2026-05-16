'use_strict';
import Tools from './DocBuilder/exports.js';

const {JSONBuilder, JSONReader, TextTools} = Tools; 

class Modal {

    #response;
    #submitButton;

    constructor(response, submitButton) {

        this.#response = response;
        this.#submitButton = submitButton;
        this.#setModal();

    }

    #createModal() {

        const modalContainer = new JSONBuilder()
        .setTagName("div")
        .setClassList("modal-container");
        const modal = new JSONBuilder()
        .setTagName("div")
        .setClassList("modal");
        const heading = new JSONBuilder()
        .setTagName("h1")
        .setTxtNodes(TextTools.addTxt("A mistake was made."));
        const message = new JSONBuilder()
        .setTagName("p")
        .setTxtNodes(TextTools.addTxt(this.#response.message));
        const buttonContainer = new JSONBuilder()
        .setTagName("div");
        const button = new JSONBuilder()
        .setTagName("button")
        .setTxtNodes(TextTools.addTxt("Ok."));

        const butts = JSONBuilder.addChildren(buttonContainer, button);
        const modalBody = JSONBuilder.addChildren(modal, heading, message, butts);
        const finishedModal = JSONBuilder.addChildren(modalContainer, modalBody);

        return finishedModal;
        
    }

    #setModal() {

        const modal = new JSONReader([this.#createModal().JSON]);
        const button = modal.Collection.find(butt => butt.tagName === "BUTTON");
        button.addEventListener("click", () => {
            document.body.style.cssText += "overflow: auto;";
            modal.Element.remove();
            if (this.#submitButton.getAttribute("aria-disabled") === "true") {
                this.#submitButton.setAttribute("aria-disabled", "false");
            }
        });

        document.body.style.cssText += "overflow: hidden;";
        document.body.append(modal.Element);

    }

}

export default Modal;
