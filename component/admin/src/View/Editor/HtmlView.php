<?php
/**
 * @package     Editor by xdecaro
 * @subpackage  com_decaroeditor
 */

namespace Xdecaro\Component\Decaroeditor\Administrator\View\Editor;

\defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\View\HtmlView as BaseHtmlView;
use Joomla\CMS\Toolbar\ToolbarHelper;

final class HtmlView extends BaseHtmlView
{
    public function display($tpl = null): void
    {
        $wa = Factory::getApplication()->getDocument()->getWebAssetManager();
        $wa->getRegistry()->addExtensionRegistryFile('com_decaroeditor');
        $wa->useStyle('com_decaroeditor.editor');
        $wa->useScript('com_decaroeditor.editor');

        ToolbarHelper::title(Text::_('COM_DECAROEDITOR'), 'edit');
        ToolbarHelper::custom('editor.preview', 'eye', 'eye', 'COM_DECAROEDITOR_PREVIEW', false);
        ToolbarHelper::custom('editor.save', 'save', 'save', 'JSAVE', false);
        ToolbarHelper::custom('editor.saveclose', 'save', 'save', 'JSAVEANDCLOSE', false);

        parent::display($tpl);
    }
}
