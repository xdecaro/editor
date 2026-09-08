<?php
/**
 * @package     Editor by xdecaro
 * @subpackage  com_decaroeditor
 */

namespace Xdecaro\Component\Decaroeditor\Administrator\Service;

defined('_JEXEC') or die;

/**
 * Safe optional boundary between Editor and Xdecaro Core.
 *
 * Editor stays usable without Core. Integrations that need the shared entity
 * reference contract receive a controlled exception when Core is unavailable
 * or older than the supported baseline.
 */
final class CoreIntegrationService
{
    public const MINIMUM_VERSION = '1.0.0';

    public function isAvailable(): bool
    {
        return class_exists(\Xdecaro\Core\Version::class)
            && class_exists(\Xdecaro\Core\Integration\EntityReference::class)
            && class_exists(\Xdecaro\Core\Integration\RelationReference::class)
            && version_compare(
                \Xdecaro\Core\Version::VERSION,
                self::MINIMUM_VERSION,
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
                'Xdecaro Core ' . self::MINIMUM_VERSION
                . ' or newer is required for Editor cross-product references.'
            );
        }
    }
}
