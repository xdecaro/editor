<?php
/**
 * @package     Editor by xdecaro
 * @subpackage  plg_editors_decaroeditor
 */

namespace Xdecaro\Plugin\Editors\Decaroeditor\Provider;

\defined('_JEXEC') or die;

use Joomla\CMS\Editor\AbstractEditorProvider;
use Joomla\Event\DispatcherInterface;
use Xdecaro\Plugin\Editors\Decaroeditor\Extension\Decaroeditor;

/**
 * Joomla 5.2+ editor provider for Decaroeditor.
 *
 * The provider is deliberately thin: the plugin keeps the renderer as the
 * single implementation so the legacy editor entry points remain compatible
 * while Joomla's modern EditorsRegistry can discover the same editor without
 * falling back to deprecated discovery.
 */
final class EditorDecaroProvider extends AbstractEditorProvider
{
    public function __construct(
        private readonly Decaroeditor $plugin,
        DispatcherInterface $dispatcher
    ) {
        $this->setDispatcher($dispatcher);
    }

    public function getName(): string
    {
        return 'decaroeditor';
    }

    public function display(string $name, string $content = '', array $attributes = [], array $params = []): string
    {
        return $this->plugin->renderEditor(
            $name,
            $content,
            (string) ($attributes['width'] ?? '100%'),
            (string) ($attributes['height'] ?? '420'),
            (int) ($attributes['col'] ?? 60),
            (int) ($attributes['row'] ?? 20),
            $params['buttons'] ?? true,
            isset($attributes['id']) ? (string) $attributes['id'] : null,
            $params['asset'] ?? null,
            $params['author'] ?? null
        );
    }
}
