<?php
declare(strict_types=1);
\define("ABSPATH", \str_replace("\\", "/", __DIR__));

$shitpatch = str_replace("/php", "", ABSPATH);
include $shitpatch . '/autoloader.php';

use Uri\WhatWg\URL;
use ImageToColorCodes\{
    Control,
    ImageTo,
};

$request = \strtoupper($_SERVER["REQUEST_METHOD"]);

if ($request === "OPTIONS") {
    $sitename = \apache_request_headers()["Host"];
    $protocol = "http://";

    if (!$_ENV['DEVELOPER_MODE'] && \apache_request_headers()["Upgrade-Insecure-Requests"] === "1") {
        $protocol = "https://";
    }
    
    $url = new Url("{$protocol}{$sitename}/")->withPath("/")->withScheme("https")->toAsciiString();
    $url = \rtrim($url, "/");

    $headers = [
        "Access-Control-Allow-Origin: {$url}", 
        "Access-Control-Allow-Methods: POST, OPTIONS",
        "Access-Control-Allow-Headers: Content-Type",
    ];

    \http_response_code(200);

    foreach ($headers as $head) {
        \header($head);
    }

    return;
}

function sendResponse(array $response): void {

    \header("Content-Type: application/json");
    echo \json_encode($response);

}

if ($request !== "POST") {
    \http_response_code(405);
    sendResponse(["error" => true, "message" => "Method Not Allowed."]);
    return;
}

if (!($_FILES["image"] ?? null) || $_FILES["image"] === [] || $_FILES["image"]["size"] === 0) {
    \http_response_code(400);
    sendResponse(["error" => true, "message" => "Image data missing. Please upload an image."]);
    return;
}

if ($_FILES["image"]["size"] > (5 * 1048576) || $_FILES["image"]["error"] == 1) {
    \http_response_code(400);
    sendResponse(["error" => true, "message" => "Image too large. Size limit of 5MB."]);
    return;
}

if (!\in_array(($_POST["converter_mode"] ?? ""), Control::Modes->getValue(), true)) {
    \http_response_code(400);
    sendResponse(["error" => true, "message" => "Invalid conversion mode. Please choose from the provided options."]);
    return;
}

if (!\in_array(($_POST["width"] ?? ""), Control::Widths->getValue(), true)) {
    \http_response_code(400);
    sendResponse(["error" => true, "message" => "Invalid image width. Please choose from the provided options."]);
    return;
}

$width = (int)$_POST["width"];

$img = match ($_POST["converter_mode"]) {
    "Hex" => ImageTo::Hex($_FILES["image"]["tmp_name"], $width),
    "RGB" => ImageTo::RGB($_FILES["image"]["tmp_name"], $width),
    "ASCII" => ImageTo::ASCII($_FILES["image"]["tmp_name"], $width)
};

$response = $img->getResponse();
$response["error"] ? \http_response_code(400) : \http_response_code(200);

sendResponse($response);
