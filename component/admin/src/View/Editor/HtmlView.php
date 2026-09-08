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
use Xdecaro\Component\Decaroeditor\Administrator\Service\CoreIntegrationService;

final class HtmlView extends BaseHtmlView
{
    public bool $coreUiActive = false;

    public function display($tpl = null): void
    {
        $wa = Factory::getApplication()->getDocument()->getWebAssetManager();
        $wa->getRegistry()->addExtensionRegistryFile('com_decaroeditor');

        $core = new CoreIntegrationService();
        $this->coreUiActive = $core->useFoundation($wa);

        $wa->useStyle('com_decaroeditor.editor');
        $wa->useScript('com_decaroeditor.editor');

        ToolbarHelper::title(Text::_('COM_DECAROEDITOR'), 'edit');

        parent::display($tpl);
    }
}
