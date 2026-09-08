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
    $controlledFailure = str_contains($exception->getMessage(), 'Xdecaro Core 1.0.0');
}

if (!$controlledFailure) {
    throw new RuntimeException('Editor must fail gracefully when optional Core is unavailable.');
}

echo "Editor optional Core integration smoke test passed.\n";
