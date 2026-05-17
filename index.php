<?php
declare(strict_types=1);

include 'php/control.php';

if (\file_exists('php/config.dev.php')) {
    include 'php/config.dev.php';
} else {
    include 'php/config.php';
}

function createList(array $options, string $string = ""): string {

    $opts = [];
    
    foreach ($options as $option) {
        $opts[] = "<option value=\"{$option}\">{$option}{$string}</option>";
    }
    
    return \implode("\n", $opts);

}

$valid_img_types = ["image/png", "image/webp", "image/gif", "image/jpeg", "image/bmp"];
$types = \implode(", ", $valid_img_types);
$modes = createList(Control::Modes->getValue());
$widths = createList(Control::Widths->getValue(), " Units");

$block_size = [];

for ($i = 1; $i <= 10; $i++) {
    $block_size[] = $i;
}

$size = createList($block_size, "px");
$auto_version = "autoVersion";

if (!\function_exists($auto_version)) $auto_version = fn ($string) => $string; 

echo <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Image to CSS (or text!)</title>
<link rel="stylesheet" href="{$auto_version($_ENV['CSS_SRC']. "styles.css")}" type="text/css">
<script type="module" src="{$auto_version($_ENV['SCRIPT_SRC']. "main.js")}"></script>
</head>
<body>
    <noscript>JavaScript is required in order for this to work correctly!</noscript>
    <div>
        <h1>Image to CSS </h1>
        <span>(or text!)</span>
    </div>
    <main>    
        <div>
            <p>Have you ever wanted a <em><strong>more</strong></em> convenient way of having a <em><strong>less</strong></em> convenient way of displaying an image on a website that's <em><strong>worse</strong></em> in <em><strong>every possible metric</strong></em> than just linking to a JPEG with an "&lt;img&gt;" element like a normal person? 
                If you said, "Yes!" for some reason, this is for you.</p>
            <p>Choose ASCII mode to get a seemingly indecipherable pile of text where every 3 characters represents 1 pixel. ASCII mode is <em><strong>incompatible</strong></em> with images that have transparency, but you can try it anyway.</p>
        </div>
        <form>
            <div class="options">
                <div>
                    <div class="opt-container">
                        <div>
                            <h2>Set Parameters</h2>
                            <p>Describe the desired mess. To change "Mode" or "Image Width" after processing, you must press the "Commit Crime" button again.</p>
                            <div class="params d-flex flex-wrap">
                                <label for="converter_mode">Mode:
                                    <select id="converter_mode">
                                        {$modes}
                                    </select>
                                </label>
                                <label for="width">Image Width:
                                    <select id="width">
                                        {$widths}
                                    </select>
                                </label>
                                <label for="block-size">Block Size:
                                    <select id="block-size">
                                        {$size}
                                    </select>
                                </label>
                            </div>
                        </div>
                        <div>
                            <h2>Choose Image</h2>
                            <p>Your image will be processed by the server, but it is <strong>not</strong> saved. JPG, PNG, WEBP, GIF, and BMP formats under 5MB are all accepted.</p>
                            <label for="file"><button>Choose File</button><span>No file chosen.</span><input type="file" id="file" accept="{$types}"></label>
                        </div>
                    </div>
                </div>
            </div>
            <input type="submit" aria-disabled="false" value="Commit Crime.">
        </form>
        <div id="canvas"><p>Your image or ASCII text will appear here. <br>Click or tap on this canvas to copy it.<br>Wider images on narrow screens will look funny.</p></div>
    </main>
    <footer>Code and Content &copy; 2026 TuxedoDemon Art. I'm sorry.</footer>
</body>
</html>
HTML;
