<?php
/**
 * @package     Editor by xdecaro
 * @subpackage  plg_editors_decaroeditor
 */

defined('_JEXEC') or die;

use Joomla\CMS\Extension\PluginInterface;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;
use Joomla\Event\DispatcherInterface;
use Xdecaro\Plugin\Editors\Decaroeditor\Extension\Decaroeditor;

return new class implements ServiceProviderInterface {
    public function register(Container $container): void
    {
        $container->set(
            PluginInterface::class,
            static function (Container $container): PluginInterface {
                $plugin = new Decaroeditor(
                    $container->get(DispatcherInterface::class),
                    (array) PluginHelper::getPlugin('editors', 'decaroeditor')
                );
                $plugin->setApplication(Joomla\CMS\Factory::getApplication());
                return $plugin;
            }
        );
    }
};
