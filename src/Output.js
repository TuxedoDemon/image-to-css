'use_strict';
import ElementTools from './DocBuilder/exports.js';

const {JSONBuilder, JSONReader, TextTools} = ElementTools;

class Output {

    static txt = null;
    static #OutputElements;
    static #response;
    static #validSizes;
    static #block_size;
    static #grid_size;

    constructor(output, response) {

        Output.#OutputElements = output;
        Output.#response = response;
        Output.#OutputElements.mode.value === "ASCII" ? Output.setASCII() : Output.createGrid();
        
    }

    static setASCII() {

        if (Output.#OutputElements.submit.getAttribute("aria-disabled") === "true") return;
        Output.#OutputElements.submit.setAttribute("aria-disabled", true);

        Output.#setSizes();
        const inlineStyling = [
            ...Output.#getGridSizeString(), 
            "text-align:justify;", 
            "word-break:break-all;", 
            "overflow-wrap:anywhere;", 
            `font-size:${Output.#block_size}px;`, 
            "font-family:'Consolas','Courier New',monospace;"
        ];
        
        const container = new JSONBuilder().setTagName("div").setInlineStyling(...inlineStyling).JSON;
        const grid = new JSONReader([container]);
        Output.txt = Output.#response.message;
        Output.#resetCanvas(grid);
        Output.#animatePrintout(Array.from(Output.#response.message), (text) => Output.#populateASCII(text, grid));

        Output.#OutputElements.submit.setAttribute("aria-disabled", false);

    }

    static async #populateASCII(text, grid) {

        const node = document.createTextNode(text);
        grid.Element.append(node);

    }

    
    static async #populateGrid(block, grid) {

        grid.Element.append(block.Element);

    }

    static #setSizes() {

        const validSizes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
        const validGrids = ["4", "6", "8", "12", "16", "24", "32", "48", "64", "96", "128"];

        Output.#block_size = validSizes.includes(Output.#OutputElements.block_size.value) ? Output.#OutputElements.block_size.value : "5";
        Output.#grid_size = validGrids.includes(Output.#OutputElements.width.value) ? Output.#OutputElements.width.value : "32";

    }

    static #getBlockSizeString() {

        return [`height:${Output.#block_size}px;`, `width:${Output.#block_size}px;`];

    }

    static #getGridSizeString(unit = "px") {

        const gridWidth = Output.#block_size * Output.#grid_size;
        return [`max-width:${gridWidth}${unit};`, `width:100%;`, `margin:0 auto;`];

    }

    static createGrid() {

        if (Output.#OutputElements.submit.getAttribute("aria-disabled") === "true") return;
        Output.#OutputElements.submit.setAttribute("aria-disabled", true);

        Output.#setSizes();
        const blocks = [];
        const container = new JSONBuilder().setTagName("div").setClassList("d-flex", "flex-wrap").setInlineStyling(...Output.#getGridSizeString()).JSON;
        const txt = [`<div class="d-flex flex-wrap" style="${Output.#getGridSizeString().join("")}">`];
        const grid = new JSONReader([container]);
        const colors = Output.#response.message.split(" ");

        for (const color of colors) {
            const css = Output.#getBlockSizeString();
            css.push(`background:${color};`);
            const block = new JSONBuilder().setTagName("div").setInlineStyling(...css).JSON;
            blocks.push(new JSONReader([block]));
            txt.push(`<div style="${css.join("")}"></div>`);
        }

        txt.push("</div>");
        Output.txt = txt.join("");
        Output.#resetCanvas(grid);
        Output.#animatePrintout(blocks, (block) => Output.#populateGrid(block, grid));

        Output.#OutputElements.submit.setAttribute("aria-disabled", false);

    }

    static #resetCanvas(grid) {

        Output.#OutputElements.canvas.innerHTML = "";
        Output.#OutputElements.canvas.append(grid.Element);

    }

    static #animatePrintout(elements, callback) {

        const animate = () => {
            if (elements.length > 0) {
                for (let i = 0; i <= 15 && elements.length > 0; i++) {
                    callback(elements[0]);
                    elements.splice(0, 1);
                }
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);

    }

}

export default Output;
