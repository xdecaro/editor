<?php
/**
 * @package     Editor by xdecaro
 * @subpackage  com_decaroeditor
 */

namespace Xdecaro\Component\Decaroeditor\Administrator\Service;

defined('_JEXEC') or die;

use Joomla\CMS\WebAsset\WebAssetManager;

/**
 * Safe optional boundary between Editor and Core by xdecaro.
 *
 * Core remains optional. Canonical Core APIs are consumed only when Core
 * 1.3.0+ is available; otherwise Editor keeps its local fallback behavior.
 */
final class CoreIntegrationService
{
    /** @deprecated Use REFERENCE_MINIMUM_VERSION for new code. */
    public const MINIMUM_VERSION = '1.3.0';
    public const REFERENCE_MINIMUM_VERSION = '1.3.0';
    public const UI_MINIMUM_VERSION = '1.3.0';

    public function isAvailable(): bool
    {
        return class_exists(\xdecaro\Core\Version::class)
            && class_exists(\xdecaro\Core\Integration\EntityReference::class)
            && class_exists(\xdecaro\Core\Integration\RelationReference::class)
            && version_compare(
                (string) \xdecaro\Core\Version::VERSION,
                self::REFERENCE_MINIMUM_VERSION,
                '>='
            );
    }

    public function isUiAvailable(): bool
    {
        return class_exists(\xdecaro\Core\Version::class)
            && class_exists(\xdecaro\Core\Asset\AssetService::class)
            && version_compare(
                (string) \xdecaro\Core\Version::VERSION,
                self::UI_MINIMUM_VERSION,
                '>='
            );
    }

    public function getInstalledVersion(): ?string
    {
        if (!class_exists(\xdecaro\Core\Version::class)) {
            return null;
        }

        return (string) \xdecaro\Core\Version::VERSION;
    }

    /**
     * Enable the Core design-token foundation when it is actually available.
     *
     * A broken or incomplete optional Core installation must never prevent the
     * editor from loading; in that case the local Editor token fallbacks stay
     * active and this method simply returns false.
     */
    public function useFoundation(WebAssetManager $webAssets): bool
    {
        if (!$this->isUiAvailable()) {
            return false;
        }

        try {
            return (new \xdecaro\Core\Asset\AssetService())->useFoundation($webAssets);
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Describe the entity whose content is being edited.
     *
     * Editor does not claim ownership of that entity. The caller must use its
     * published Joomla component element, entity type and stable identifier.
     */
    public function createContextReference(
        string $component,
        string $entity,
        int|string $id
    ): object {
        $this->assertAvailable();

        return new \xdecaro\Core\Integration\EntityReference(
            $component,
            $entity,
            $id
        );
    }

    private function assertAvailable(): void
    {
        if (!$this->isAvailable()) {
            throw new \RuntimeException(
                'Core by xdecaro ' . self::REFERENCE_MINIMUM_VERSION
                . ' or newer is required for Editor cross-product references.'
            );
        }
    }
}
