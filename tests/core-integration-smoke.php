<?php

define('_JEXEC', 1);

require_once __DIR__ . '/../component/admin/src/Service/CoreIntegrationService.php';

use Xdecaro\Component\Decaroeditor\Administrator\Service\CoreIntegrationService;

$service = new CoreIntegrationService();

if ($service->isAvailable()) {
    throw new RuntimeException('Core should not be available in the isolated Editor smoke test.');
}

if ($service->isUiAvailable()) {
    throw new RuntimeException('Core UI should not be available in the isolated Editor smoke test.');
}

if ($service->getInstalledVersion() !== null) {
    throw new RuntimeException('An absent Core installation must report no installed version.');
}

$controlledFailure = false;

try {
    $service->createContextReference('com_content', 'article', 1);
} catch (RuntimeException $exception) {
    $controlledFailure = str_contains($exception->getMessage(), 'Core by xdecaro 1.3.0');
}

if (!$controlledFailure) {
    throw new RuntimeException('Editor must fail gracefully when optional Core is unavailable.');
}

$source = file_get_contents(__DIR__ . '/../component/admin/src/Service/CoreIntegrationService.php');
if ($source === false || !str_contains($source, 'xdecaro\\Core') || str_contains($source, 'Xdecaro\\Core')) {
    throw new RuntimeException('Editor must consume only the canonical xdecaro\\Core namespace.');
}

echo "Editor optional Core 1.3 integration smoke test passed.\n";
