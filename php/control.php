<?php
declare(strict_types=1);

enum Control {

    case Widths;
    case Modes;
    
    public function getValue(): array {

        return match ($this) {
            $this::Widths => ["4", "6", "8", "12", "16", "24", "32", "48", "64", "96", "128"],
            $this::Modes => ["Hex", "RGB", "ASCII"],
        };
        
    }

}
