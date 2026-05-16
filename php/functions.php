<?php
declare(strict_types=1);

function autoVersion(string $file): string {
        
    $exists = match (false) {
        \strpos($file, '/') === 0,
        \file_exists("{$_SERVER['DOCUMENT_ROOT']}{$file}"),
        !$_ENV['DEVELOPER_MODE'] => false,
        default => true,
    };
    
    if (!$exists) return $file;

    $mtime = \filemtime("{$_SERVER['DOCUMENT_ROOT']}{$file}");
    $final = \preg_replace('{\\.([^./]+)$}', ".{$mtime}.\$1", $file);
    
    return $final;
    
}
