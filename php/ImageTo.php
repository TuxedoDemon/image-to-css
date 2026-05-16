<?php
declare(strict_types=1);

class ImageTo {

            private bool $error = false;
            private static bool $ascii = false;
            private static int|bool $imgtype = 0;
            private ?GdImage $image = null;
            private ?string $string = null;
            private static array $table = [];

        private function __construct(string $imgpath, private int $width, private int $height) {

            $this->image = $this->createImageObject($imgpath);

        }

    public static function ASCII(string $imgpath, int $width = 32, int $height = -1): self { 
        
        self::buildASCIILookupTable();  // ascii values found on a keyboard can't represent the full spectrum of color so this mode needs its own lookup table
        self::$ascii = true;            // ascii values also can't adequately do transparency so we need to let the rest of the program 
                                        // know not to bother with an alpha channel even if there is one, so we set $ascii to true and that's the tell
        return new self($imgpath, $width, $height)->createPixels(
            fn ($rgb) => self::createASCIIString($rgb)
        );

    }

    public static function Hex(string $imgpath, int $width = 32, int $height = -1): self {
        
        self::buildTrueColorLookupTable();

        return new self($imgpath, $width, $height)->createPixels(
            fn ($rgb) => self::createHexString($rgb)
        );

    }

    public static function RGB(string $imgpath, int $width = 32, int $height = -1): self {

        self::buildTrueColorLookupTable();

        return new self($imgpath, $width, $height)->createPixels(
            fn ($rgb) => self::createRGBString($rgb)
        );

    }

    public function getResponse(): array {

        return [
            "error" => $this->error, 
            "message" => $this->getString()
        ];

    }

    public function getString(): string {

        if (!($this->string ?? null)) {
            $this->error = true;
            $this->string = "No image set.";
        }

        return $this->string;

    }
        
    /* ascii characters range from 0-255 the same way each color channel does,
    *  but what's actually found on a keyboard only has a range of 32-126
    *  we need a translation table that maps 0 => 32, and 255 => 126, and so on, to get this to work
    *  so that's what this function does. The actual RGB value is the array key, and the one it becomes as a typable character is the array value.
    *  we build that up front and cache it away for use with the intToColor function later
    */

    private static function buildASCIILookupTable(): void {
        
        $table = []; 

        for ($i = 0; $i <= 255; $i++) {
            $table[] = \intdiv($i * 94 + 127, 255) + 32;
        }

        self::$table = $table;
        
    }

    /* 
    *  this does the same as the above, minus the translation math. might not be needed but felt cleaner to have
    */

    private static function buildTrueColorLookupTable(): void {
        
        $table = [];

        for ($i = 0; $i <= 255; $i++) {
            $table[] = $i;
        }

        self::$table = $table;
        
    }

    private function createImageObject(string $imgpath): ?GdImage {

        if (!\file_exists($imgpath)) {
            $this->error = true;
            $this->string = "The file you're trying to convert does not exist.";
            return null;
        }

        self::$imgtype = \exif_imagetype($imgpath);

        $img = match (self::$imgtype) {
            2 => \imagecreatefromjpeg($imgpath),
            3 => @\imagecreatefrompng($imgpath), // sometimes PNGs have an erroneous sRGB profile?? we can't fix it but this yells about it anyway, so we tell it to shut up
            18 => \imagecreatefromwebp($imgpath),
            6 => \imagecreatefrombmp($imgpath),
            1 => \imagecreatefromgif($imgpath),
            default => null,
        };

        if (!$img) {
            $this->error = true;
            $this->string = "The file you're trying to convert is either in an incompatible format or corrupted. Please try another image.";
            return null;
        }

        return \imagescale($img, $this->width, $this->height, IMG_MITCHELL);

    }

    private function createPixels(callable $callback): self {

        if (!$this->image) return $this;

        $imgheight = \imagesy($this->image);
        $imgwidth = \imagesx($this->image);
        $pixels = [];

        for ($y = 0; $y < $imgheight; $y++) {
            for ($x = 0; $x < $imgwidth; $x++) {
                $pixel = \imagecolorat($this->image, $x, $y);
                $rgb = $this->imageColorsForIndex($pixel);
                $pixels[] = $callback($rgb);
            }
        }

        $this->string = self::$ascii ? \implode($pixels) : \trim(implode($pixels));

        return $this;

    }

    private function imageColorsForIndex(int $pixel): array {

        if (self::$ascii) return self::imageColorsForIndexNoAlpha($pixel);
        
        return match (self::$imgtype) {
            3,
            18 => self::imageColorsForIndexAlpha($pixel),
            2,
            6 => self::imageColorsForIndexNoAlpha($pixel),
            1 => \imagecolorsforindex($this->image, $pixel),    // according to documentation, bit shifting on the alpha channel doesn't work right for gifs
        };                                                      // so we just use the slower native function instead
        
    }

    private static function imageColorsForIndexNoAlpha(int $pixel): array {

        return [    // was yoinkus'd from the php documentation. i know what this is doing but im not smart enough to think of it myself
            ($pixel >> 16) & 0xFF,  // red
            ($pixel >> 8) & 0xFF,   //green
            $pixel & 0xFF,          // blue
        ];

    }

    private static function imageColorsForIndexAlpha(int $pixel): array {

        return [
            ($pixel >> 16) & 0xFF,      // red
            ($pixel >> 8) & 0xFF,       // green
            $pixel & 0xFF,              // blue
            ($pixel & 0x7F000000) >> 24 // alpha for some reason
        ];

    }

    private static function createHexString(array $rgb): string {

        $val = self::intToColor(fn ($val) => \sprintf('%02X', $val), ...$rgb);

        if (\strlen($val) === 8) {
            $alpha = \substr($val, 6, 8);
            $val = \substr($val, 0, 6);
            if ($alpha !== "00") {  // 0 is fully opaque and 127 (not 255, bc the alpha channel is 7 bit) is transparent for some reason, at this stage, because ??? 
                $alpha = \hexdec($alpha);   // so if a hex string is ended with 00, we just substr it off. 
                                            // saves a few characters in the final output.
                $alpha = 255 - (\intval($alpha * (255 / 127))); // the value inversion (00 being opaque and FF being transparent) and also the alpha channel being 7 bit          
                $alpha = \strtoupper(\sprintf('%02s', \dechex($alpha))); // doesn't translate nicely to anything without requiring some math done to it, 
                $val .= $alpha;                                          // so we do that math here.
                                                                        
            }
        }

        return "#{$val}\x20";

    }

    private static function createASCIIString(array $rgb): string {

        return self::intToColor(fn ($val) => \chr($val), ...$rgb);

    }

    private static function createRGBString(array $rgb): string {

        $val = self::intToColor(fn ($val) => \sprintf("%d,", $val), ...$rgb);
        $val = \trim($val, ",");
        $rgb = self::setRGBType();

        if ($rgb === "rgba") {
            $val = \explode(",", $val);
            $val[3] = \round(1 - ($val[3] / 127), 2);   // again, we have to do some math to account for both the inversion 
            $val = \implode(",", $val);                 // and also the non-255 scale for the alpha channel to get something usable
        }

        return "{$rgb}({$val})\x20";

    }

    private static function setRGBType(): string {

        if (self::$ascii) return "rgb";

        return match (self::$imgtype) {
            2,
            6 => "rgb",
            default => "rgba",
        };

    }

    private static function intToColor(callable $callback, int ...$value): string {
        
        $string = [];
        
        foreach ($value as $val) {
            $string[] = $callback(self::$table[$val]);
        }

        return \implode($string);

    }

}
