<?php
declare(strict_types=1);
namespace ImageToColorCodes;

enum Control {

    case Widths;
    case Modes;
    case Types;
    
    public function getValue(): array {

        return match ($this) {
            $this::Widths => ["4", "6", "8", "12", "16", "24", "32", "48", "64", "96", "128"],
            $this::Modes => ["Hex", "RGB", "ASCII"],
            $this::Types => [
                1 => ["mime" => "image/gif", "function" => fn ($data) => \imagecreatefromgif($data)],
                2 => ["mime" => "image/jpeg", "function" => fn ($data) => \imagecreatefromjpeg($data)],
                3 => ["mime" => "image/png", "function" => fn ($data) => @\imagecreatefrompng($data)],
                6 => ["mime" => "image/bmp", "function" => fn ($data) => \imagecreatefrombmp($data)],
                18 => ["mime" => "image/webp", "function" => fn ($data) => \imagecreatefromwebp($data)]
            ]
        };
        
    }

}
