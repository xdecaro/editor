<?php
/**
 * @package     Editor by xdecaro
 * @subpackage  com_decaroeditor
 */

defined('_JEXEC') or die;

use Joomla\CMS\Language\Text;

$blocks = [
    'heading' => ['icon' => 'H', 'label' => 'COM_DECAROEDITOR_BLOCK_HEADING'],
    'text' => ['icon' => 'T', 'label' => 'COM_DECAROEDITOR_BLOCK_TEXT'],
    'image' => ['icon' => '▧', 'label' => 'COM_DECAROEDITOR_BLOCK_IMAGE'],
    'video' => ['icon' => '▶', 'label' => 'COM_DECAROEDITOR_BLOCK_VIDEO'],
    'gallery' => ['icon' => '▦', 'label' => 'COM_DECAROEDITOR_BLOCK_GALLERY'],
    'button' => ['icon' => '▭', 'label' => 'COM_DECAROEDITOR_BLOCK_BUTTON'],
    'quote' => ['icon' => '❝', 'label' => 'COM_DECAROEDITOR_BLOCK_QUOTE'],
    'divider' => ['icon' => '—', 'label' => 'COM_DECAROEDITOR_BLOCK_DIVIDER'],
    'file' => ['icon' => '⌑', 'label' => 'COM_DECAROEDITOR_BLOCK_FILE'],
    'embed' => ['icon' => '{}', 'label' => 'COM_DECAROEDITOR_BLOCK_EMBED'],
    'columns' => ['icon' => '▥', 'label' => 'COM_DECAROEDITOR_BLOCK_COLUMNS'],
];
?>
<div class="xdecaro-scope" data-xde-core-ui="<?php echo $this->coreUiActive ? '1' : '0'; ?>">
    <div class="xde-editor-shell" data-xde-editor>
        <aside class="xde-editor-sidebar xde-editor-sidebar--blocks" aria-label="<?php echo Text::_('COM_DECAROEDITOR_ADD_CONTENT'); ?>">
            <div class="xde-editor-panel-heading">
                <strong><?php echo Text::_('COM_DECAROEDITOR_ADD_CONTENT'); ?></strong>
                <button type="button" class="xde-icon-button" data-xde-toggle="blocks" aria-label="<?php echo Text::_('COM_DECAROEDITOR_COLLAPSE'); ?>">‹</button>
            </div>
            <label class="visually-hidden" for="xde-block-search"><?php echo Text::_('COM_DECAROEDITOR_SEARCH_BLOCKS'); ?></label>
            <input id="xde-block-search" class="form-control xde-block-search" type="search" placeholder="<?php echo Text::_('COM_DECAROEDITOR_SEARCH_BLOCKS'); ?>" data-xde-block-search>
            <div class="xde-block-list" data-xde-block-list>
                <?php foreach ($blocks as $type => $block) : ?>
                    <button type="button" class="xde-block-button" data-xde-add-block="<?php echo htmlspecialchars($type, ENT_QUOTES, 'UTF-8'); ?>">
                        <span class="xde-block-icon" aria-hidden="true"><?php echo htmlspecialchars($block['icon'], ENT_QUOTES, 'UTF-8'); ?></span>
                        <span><?php echo Text::_($block['label']); ?></span>
                    </button>
                <?php endforeach; ?>
            </div>
            <div class="xde-sidebar-hint"><?php echo Text::_('COM_DECAROEDITOR_SLASH_HINT'); ?></div>
        </aside>

        <main class="xde-editor-workspace">
            <div class="xde-editor-meta">
                <span class="xde-save-state" data-xde-save-state><?php echo Text::_('COM_DECAROEDITOR_SAVED'); ?></span>
                <div class="xde-history-actions" aria-label="<?php echo Text::_('COM_DECAROEDITOR_HISTORY'); ?>">
                    <button type="button" class="xde-icon-button" data-xde-undo title="<?php echo Text::_('COM_DECAROEDITOR_UNDO'); ?>">↶</button>
                    <button type="button" class="xde-icon-button" data-xde-redo title="<?php echo Text::_('COM_DECAROEDITOR_REDO'); ?>">↷</button>
                </div>
            </div>

            <input class="xde-document-title" type="text" value="<?php echo Text::_('COM_DECAROEDITOR_DEMO_TITLE'); ?>" aria-label="<?php echo Text::_('COM_DECAROEDITOR_TITLE'); ?>">
            <p class="xde-document-lead"><?php echo Text::_('COM_DECAROEDITOR_DEMO_LEAD'); ?></p>

            <div class="xde-inline-toolbar" data-xde-inline-toolbar hidden>
                <button type="button" data-xde-command="bold"><strong>B</strong></button>
                <button type="button" data-xde-command="italic"><em>I</em></button>
                <button type="button" data-xde-command="createLink">🔗</button>
                <button type="button" data-xde-command="removeFormat">•••</button>
            </div>

            <div class="xde-editor-canvas" contenteditable="true" role="textbox" aria-multiline="true" data-xde-canvas>
                <p><?php echo Text::_('COM_DECAROEDITOR_DEMO_TEXT'); ?></p>
            </div>

            <button type="button" class="xde-add-content" data-xde-open-slash>＋ <?php echo Text::_('COM_DECAROEDITOR_ADD_CONTENT'); ?></button>

            <div class="xde-slash-menu" data-xde-slash-menu hidden>
                <input type="search" class="form-control" placeholder="<?php echo Text::_('COM_DECAROEDITOR_SEARCH_BLOCKS'); ?>" data-xde-slash-search>
                <div data-xde-slash-results></div>
            </div>
        </main>

        <aside class="xde-editor-sidebar xde-editor-sidebar--properties" data-xde-properties aria-label="<?php echo Text::_('COM_DECAROEDITOR_PROPERTIES'); ?>">
            <div class="xde-editor-panel-heading">
                <strong><?php echo Text::_('COM_DECAROEDITOR_PROPERTIES'); ?></strong>
                <button type="button" class="xde-icon-button" data-xde-toggle="properties" aria-label="<?php echo Text::_('COM_DECAROEDITOR_COLLAPSE'); ?>">›</button>
            </div>
            <div class="xde-properties-empty" data-xde-properties-empty><?php echo Text::_('COM_DECAROEDITOR_PROPERTIES_EMPTY'); ?></div>
            <div data-xde-properties-form></div>
        </aside>
    </div>

    <div class="xde-mobile-property-bar" data-xde-mobile-properties hidden>
        <button type="button" class="btn btn-primary" data-xde-mobile-properties-open><?php echo Text::_('COM_DECAROEDITOR_EDIT_BLOCK'); ?></button>
    </div>
</div>
