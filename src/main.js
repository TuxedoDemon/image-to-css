'use_strict';
import Uploader from './Uploader.js';
import Output from './Output.js';
import Modal from './Modal.js';
import HandleFile from './HandleFile.js';

const handler = HandleFile.init();

const FormData = {
    form: document.querySelector("form"),
    submit: document.querySelector(`input[type="submit"]`),
    mode: document.getElementById("converter_mode"),
    width: document.getElementById("width"),
    file: () => handler.file,
};

const OutputData = {
    mode: document.getElementById("converter_mode"),
    width: document.getElementById("width"),
    block_size: document.getElementById("block-size"),
    canvas: document.getElementById("canvas"),
    submit: document.querySelector(`input[type="submit"]`),
};

function calculateAngle() {

    const rem = parseInt(getComputedStyle(document.documentElement).fontSize);
    const width = parseFloat(getComputedStyle(document.querySelector("body > div:first-of-type")).width);
    const height = parseFloat(getComputedStyle(document.querySelector("body > div:first-of-type")).height) - rem * 4;

    const hypot = Math.sqrt(width**2 + (height)**2);
    const small_angle = 180 - (Math.asin((height) / hypot) * 180 / Math.PI);

    return `${small_angle}deg`;

}

function setAngle() {

    document.body.style.setProperty("--gradient-angle", calculateAngle());

}


function animateTooltip(tooltip, duration, y) {

    let zero;

    requestAnimationFrame(firstFrame);

    function firstFrame(timestamp) {

        zero = timestamp;
        animate(timestamp, y);

    }

    function animate(timestamp, y) {

        const value = (timestamp - zero) / duration;

        if (value < 1) {
            y--;
            tooltip.style.setProperty("--top", `${y}px`);
            requestAnimationFrame((t) => animate(t, y));
        } else {
            tooltip.remove();
        }

    }

}

const handleCopyEvent = (e) => {

    if (Output.txt) {
        e.stopPropagation();
        const duration = 3000;
        const tooltip = document.createElement("div");
        const message = document.createTextNode("Code Copied!");
        tooltip.append(message);
        const rect = OutputData.canvas.getBoundingClientRect();
        navigator.clipboard.writeText(Output.txt);
        tooltip.classList.add("tooltip");
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        tooltip.style.setProperty("--top", `${y}px`);
        tooltip.style.setProperty("--left", `${x - 50}px`);
        tooltip.style.cssText += `animation-duration: ${duration}ms; left: var(--left); top: var(--top);`;
        OutputData.canvas.append(tooltip);
        animateTooltip(tooltip, duration, y);
    }

}

function copyText() {

    OutputData.canvas.removeEventListener("click", handleCopyEvent);
    OutputData.canvas.addEventListener("click", handleCopyEvent);

}

const func = () => OutputData.mode.value === "ASCII" ? Output.setASCII() : Output.createGrid();

function changeBlockSize() {

    OutputData.block_size.removeEventListener("change", func);
    OutputData.block_size.addEventListener("change", func);

}

FormData.form.addEventListener("submit", async e => {
    e.preventDefault();
    if (FormData.submit.getAttribute("aria-disabled") === "true") return;
    await new Uploader(FormData).handleSubmitEvent((response) => response.error ? new Modal(response, FormData.submit) : new Output(OutputData, response));
    changeBlockSize();
    copyText();
});

setAngle();
window.addEventListener("resize", setAngle);
