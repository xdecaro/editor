<?php
/**
 * @package     Editor by xdecaro
 * @subpackage  plg_editors_decaroeditor
 */

namespace Xdecaro\Plugin\Editors\Decaroeditor\Extension;

\defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Uri\Uri;

final class Decaroeditor extends CMSPlugin
{
    protected $autoloadLanguage = true;

    /**
     * Render the editor field while keeping the original textarea as the canonical Joomla value.
     */
    public function onDisplay($name, $content, $width, $height, $col, $row, $buttons = true, $id = null, $asset = null, $author = null)
    {
        $id = $id ?: preg_replace('/[^A-Za-z0-9_-]+/', '-', (string) $name);
        $document = Factory::getApplication()->getDocument();
        $wa = $document->getWebAssetManager();
        $wa->getRegistry()->addExtensionRegistryFile('com_decaroeditor');
        $wa->useStyle('com_decaroeditor.editor');
        $wa->useScript('com_decaroeditor.editor');

        $safeId = htmlspecialchars((string) $id, ENT_QUOTES, 'UTF-8');
        $safeName = htmlspecialchars((string) $name, ENT_QUOTES, 'UTF-8');
        $safeContent = htmlspecialchars((string) $content, ENT_NOQUOTES, 'UTF-8');

        return <<<HTML
<div class="xde-editor-field" data-xde-field-editor>
    <textarea name="{$safeName}" id="{$safeId}" hidden>{$safeContent}</textarea>
    <div class="xde-editor-shell xde-editor-shell--field" data-xde-editor data-xde-source="#{$safeId}">
        <aside class="xde-editor-sidebar xde-editor-sidebar--blocks">
            <div class="xde-editor-panel-heading"><strong>Blocks</strong></div>
            <div class="xde-block-list">
                <button type="button" class="xde-block-button" data-xde-add-block="heading"><span class="xde-block-icon">H</span><span>Heading</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="text"><span class="xde-block-icon">T</span><span>Text</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="image"><span class="xde-block-icon">▧</span><span>Image</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="video"><span class="xde-block-icon">▶</span><span>Video</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="quote"><span class="xde-block-icon">❝</span><span>Quote</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="button"><span class="xde-block-icon">▭</span><span>Button</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="divider"><span class="xde-block-icon">—</span><span>Divider</span></button>
                <button type="button" class="xde-block-button" data-xde-add-block="columns"><span class="xde-block-icon">▥</span><span>Columns</span></button>
            </div>
        </aside>
        <main class="xde-editor-workspace">
            <div class="xde-editor-meta"><span class="xde-save-state" data-xde-save-state>Saved ✓</span><div class="xde-history-actions"><button type="button" class="xde-icon-button" data-xde-undo>↶</button><button type="button" class="xde-icon-button" data-xde-redo>↷</button></div></div>
            <div class="xde-inline-toolbar" data-xde-inline-toolbar hidden><button type="button" data-xde-command="bold"><strong>B</strong></button><button type="button" data-xde-command="italic"><em>I</em></button><button type="button" data-xde-command="createLink">🔗</button></div>
            <div class="xde-editor-canvas" contenteditable="true" role="textbox" aria-multiline="true" data-xde-canvas></div>
            <button type="button" class="xde-add-content" data-xde-open-slash>＋ Add content</button>
            <div class="xde-slash-menu" data-xde-slash-menu hidden><input type="search" class="form-control" placeholder="Search blocks…" data-xde-slash-search><div data-xde-slash-results></div></div>
        </main>
        <aside class="xde-editor-sidebar xde-editor-sidebar--properties" data-xde-properties>
            <div class="xde-editor-panel-heading"><strong>Properties</strong></div>
            <div class="xde-properties-empty" data-xde-properties-empty>Select a block to edit its properties.</div>
            <div data-xde-properties-form></div>
        </aside>
    </div>
</div>
HTML;
    }

    public function onGetContent($id)
    {
        return '';
    }

    public function onSetContent($id, $html)
    {
        return '';
    }

    public function onGetInsertMethod()
    {
        return '';
    }
}
