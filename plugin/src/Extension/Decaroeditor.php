<?php
/**
 * @package     Editor by xdecaro
 * @subpackage  plg_editors_decaroeditor
 */

namespace Xdecaro\Plugin\Editors\Decaroeditor\Extension;

\defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Plugin\CMSPlugin;

final class Decaroeditor extends CMSPlugin
{
    protected $autoloadLanguage = true;

    /**
     * Render the editor field while keeping the original textarea as the canonical Joomla value.
     */
    public function onDisplay($name, $content, $width, $height, $col, $row, $buttons = true, $id = null, $asset = null, $author = null)
    {
        $id = $id ?: preg_replace('/[^A-Za-z0-9_-]+/', '-', (string) $name);

        $app = Factory::getApplication();
        $app->getLanguage()->load('com_decaroeditor', JPATH_ADMINISTRATOR);

        $wa = $app->getDocument()->getWebAssetManager();
        $wa->getRegistry()->addExtensionRegistryFile('com_decaroeditor');
        $wa->useStyle('com_decaroeditor.editor');
        $wa->useScript('com_decaroeditor.editor');
        $wa->useScript('com_decaroeditor.field');

        $safeId = htmlspecialchars((string) $id, ENT_QUOTES, 'UTF-8');
        $safeName = htmlspecialchars((string) $name, ENT_QUOTES, 'UTF-8');
        $safeContent = htmlspecialchars((string) $content, ENT_NOQUOTES, 'UTF-8');

        $labels = [
            'blocks' => Text::_('COM_DECAROEDITOR_ADD_CONTENT'),
            'heading' => Text::_('COM_DECAROEDITOR_BLOCK_HEADING'),
            'text' => Text::_('COM_DECAROEDITOR_BLOCK_TEXT'),
            'image' => Text::_('COM_DECAROEDITOR_BLOCK_IMAGE'),
            'video' => Text::_('COM_DECAROEDITOR_BLOCK_VIDEO'),
            'quote' => Text::_('COM_DECAROEDITOR_BLOCK_QUOTE'),
            'button' => Text::_('COM_DECAROEDITOR_BLOCK_BUTTON'),
            'divider' => Text::_('COM_DECAROEDITOR_BLOCK_DIVIDER'),
            'columns' => Text::_('COM_DECAROEDITOR_BLOCK_COLUMNS'),
            'saved' => Text::_('COM_DECAROEDITOR_SAVED'),
            'properties' => Text::_('COM_DECAROEDITOR_PROPERTIES'),
            'propertiesEmpty' => Text::_('COM_DECAROEDITOR_PROPERTIES_EMPTY'),
            'search' => Text::_('COM_DECAROEDITOR_SEARCH_BLOCKS'),
        ];

        foreach ($labels as &$label) {
            $label = htmlspecialchars($label, ENT_QUOTES, 'UTF-8');
        }
        unset($label);

        return <<<HTML
<div class="xde-editor-field" data-xde-field-editor>
    <textarea name="{$safeName}" id="{$safeId}" hidden>{$safeContent}</textarea>
    <div class="xde-editor-shell xde-editor-shell--field" data-xde-editor data-xde-source="#{$safeId}">
        <aside class="xde-editor-sidebar xde-editor-sidebar--blocks">
            <div class="xde-editor-panel-heading"><strong>{$labels['blocks']}</strong></div>
            <div class="xde-block-list">
                <button type="button" class="xde-block-button" data-xde-add-block="heading"><span class="xde-block-icon">H</span><span>{$labels['heading']}</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="text"><span class="xde-block-icon">T</span><span>{$labels['text']}</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="image"><span class="xde-block-icon">▧</span><span>{$labels['image']}</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="video"><span class="xde-block-icon">▶</span><span>{$labels['video']}</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="quote"><span class="xde-block-icon">❝</span><span>{$labels['quote']}</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="button"><span class="xde-block-icon">▭</span><span>{$labels['button']}</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="divider"><span class="xde-block-icon">—</span><span>{$labels['divider']}</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="columns"><span class="xde-block-icon">▥</span><span>{$labels['columns']}</span></button>
            </div>
        </aside>
        <main class="xde-editor-workspace">
            <div class="xde-editor-meta"><span class="xde-save-state" data-xde-save-state>{$labels['saved']}</span><div class="xde-history-actions"><button type="button" class="xde-icon-button" data-xde-undo>↶</button><button type="button" class="xde-icon-button" data-xde-redo>↷</button></div></div>
            <div class="xde-inline-toolbar" data-xde-inline-toolbar hidden><button type="button" data-xde-command="bold"><strong>B</strong></button><button type="button" data-xde-command="italic"><em>I</em></button><button type="button" data-xde-command="createLink">🔗</button></div>
            <div class="xde-editor-canvas" contenteditable="true" role="textbox" aria-multiline="true" data-xde-canvas></div>
            <button type="button" class="xde-add-content" data-xde-open-slash>＋ {$labels['blocks']}</button>
            <div class="xde-slash-menu" data-xde-slash-menu hidden><input type="search" class="form-control" placeholder="{$labels['search']}" data-xde-slash-search><div data-xde-slash-results></div></div>
        </main>
        <aside class="xde-editor-sidebar xde-editor-sidebar--properties" data-xde-properties>
            <div class="xde-editor-panel-heading"><strong>{$labels['properties']}</strong></div>
            <div class="xde-properties-empty" data-xde-properties-empty>{$labels['propertiesEmpty']}</div>
            <div data-xde-properties-form></div>
        </aside>
    </div>
</div>
HTML;
    }

    public function onGetContent($id)
    {
        $safeId = json_encode((string) $id, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
        return "Joomla.editors.instances[$safeId]?.getValue() || document.getElementById($safeId)?.value || '';";
    }

    public function onSetContent($id, $html)
    {
        $safeId = json_encode((string) $id, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
        $safeHtml = json_encode((string) $html, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
        return "if (Joomla.editors.instances[$safeId]) { Joomla.editors.instances[$safeId].setValue($safeHtml); }";
    }

    public function onGetInsertMethod()
    {
        return "Joomla.editors.instances[editor]?.replaceSelection(text);";
    }
}
