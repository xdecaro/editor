<?php
/**
 * @package     Editor by xdecaro
 * @subpackage  com_decaroeditor
 */

namespace Xdecaro\Component\Decaroeditor\Administrator\Service;

defined('_JEXEC') or die;

use Joomla\CMS\WebAsset\WebAssetManager;

/**
 * Safe optional boundary between Editor and Xdecaro Core.
 *
 * The public reference contract remains compatible with Core 1.0.0+, while
 * shared UI assets are consumed only when Core 1.1.0+ is available. Editor
 * remains fully usable with its local fallback when Core is absent.
 */
final class CoreIntegrationService
{
    /** @deprecated Use REFERENCE_MINIMUM_VERSION for new code. */
    public const MINIMUM_VERSION = '1.0.0';
    public const REFERENCE_MINIMUM_VERSION = '1.0.0';
    public const UI_MINIMUM_VERSION = '1.1.0';

    public function isAvailable(): bool
    {
        return class_exists(\Xdecaro\Core\Version::class)
            && class_exists(\Xdecaro\Core\Integration\EntityReference::class)
            && class_exists(\Xdecaro\Core\Integration\RelationReference::class)
            && version_compare(
                \Xdecaro\Core\Version::VERSION,
                self::REFERENCE_MINIMUM_VERSION,
                '>='
            );
    }

    public function isUiAvailable(): bool
    {
        return class_exists(\Xdecaro\Core\Version::class)
            && class_exists(\Xdecaro\Core\Asset\AssetService::class)
            && version_compare(
                \Xdecaro\Core\Version::VERSION,
                self::UI_MINIMUM_VERSION,
                '>='
            );
    }

    public function getInstalledVersion(): ?string
    {
        if (!class_exists(\Xdecaro\Core\Version::class)) {
            return null;
        }

        return \Xdecaro\Core\Version::VERSION;
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
            return (new \Xdecaro\Core\Asset\AssetService())->useFoundation($webAssets);
        } catch (\Throwable $exception) {
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

        return new \Xdecaro\Core\Integration\EntityReference(
            $component,
            $entity,
            $id
        );
    }

    private function assertAvailable(): void
    {
        if (!$this->isAvailable()) {
            throw new \RuntimeException(
                'Xdecaro Core ' . self::REFERENCE_MINIMUM_VERSION
                . ' or newer is required for Editor cross-product references.'
            );
        }
    }
}
