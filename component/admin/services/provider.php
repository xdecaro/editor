<?php
/**
 * @package     Editor by xdecaro
 * @subpackage  com_decaroeditor
 */

defined('_JEXEC') or die;

use Joomla\CMS\Dispatcher\ComponentDispatcherFactoryInterface;
use Joomla\CMS\Extension\ComponentInterface;
use Joomla\CMS\Extension\Service\Provider\ComponentDispatcherFactory;
use Joomla\CMS\Extension\Service\Provider\MVCFactory;
use Joomla\CMS\MVC\Factory\MVCFactoryInterface;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;
use Xdecaro\Component\Decaroeditor\Administrator\Extension\DecaroeditorComponent;
use Xdecaro\Component\Decaroeditor\Administrator\Service\CoreIntegrationService;

return new class implements ServiceProviderInterface {
    public function register(Container $container): void
    {
        $container->registerServiceProvider(new MVCFactory('Xdecaro\\Component\\Decaroeditor'));
        $container->registerServiceProvider(new ComponentDispatcherFactory('Xdecaro\\Component\\Decaroeditor'));

        $container->share(
            CoreIntegrationService::class,
            static fn (Container $container): CoreIntegrationService => new CoreIntegrationService()
        );

        $container->set(
            ComponentInterface::class,
            static function (Container $container): ComponentInterface {
                return new DecaroeditorComponent(
                    $container->get(ComponentDispatcherFactoryInterface::class),
                    $container->get(MVCFactoryInterface::class)
                );
            }
        );
    }
};
