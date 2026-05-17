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
    const height = parseFloat(getComputedStyle(document.querySelector("body > div:first-of-type")).height) - (rem * 4);

    const hypot = Math.sqrt(width**2 + (height)**2);
    const small_angle = 180 - (Math.asin((height) / hypot) * 180 / Math.PI);

    return `${small_angle}deg`;

}

function setAngle() {

    document.body.style.setProperty("--gradient-angle", calculateAngle());

}


function animateTooltip(tooltip, duration, y) {

    let zero;    
    const animate = (timestamp, y) => {
        const value = (timestamp - zero) / duration;
        if (value < 1) {
            y--;
            tooltip.style.setProperty("--top", `${y}px`);
            requestAnimationFrame((t) => animate(t, y));
        } else {
            tooltip.remove();
        }
    }
    const firstFrame = (timestamp) => {
        zero = timestamp;
        animate(timestamp, y);
    }

    requestAnimationFrame(firstFrame);

}

const handleCopyEvent = async (e) => {

    if (!Output.txt) return;
    
    let message;
    const coords = getRect(e);
    const [tooltip, duration, y] = createToolTip(coords);
    await navigator.clipboard.writeText(Output.txt).then(
        success => message = document.createTextNode("Code Copied!"),
        rejected => message = document.createTextNode("Couldn't Copy! Too Big!!")
    );
    tooltip.append(message);
    OutputData.canvas.append(tooltip);
    animateTooltip(tooltip, duration, y);

}

function getRect(e) {

    const rect = OutputData.canvas.getBoundingClientRect();
    const coords = {
        x : e.clientX - rect.left,
        y : e.clientY - rect.top
    };

    return coords;

}

function createToolTip(coords) {

    const duration = 3000;
    const tooltip = document.createElement("div");

    tooltip.classList.add("tooltip");
    tooltip.style.setProperty("--top", `${coords.y}px`);
    tooltip.style.setProperty("--left", `${coords.x - 100}px`);
    tooltip.style.cssText += `animation-duration: ${duration}ms; left: var(--left); top: var(--top);`;

    return [tooltip, duration, coords.y];

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
