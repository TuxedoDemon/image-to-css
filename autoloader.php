<?php
declare(strict_types=1);

\spl_autoload_register(function (string $namespace): void {

    $path = \str_replace('\\', '/', $namespace);
    $file =  ABSPATH."/{$path}.php"; 

    if (\file_exists($file)) require_once $file;
    
});
