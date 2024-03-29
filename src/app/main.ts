import { App, createApp } from 'vue';
import appServices from '@/app/constructors';
import { IInstantiationService, IServiceIdentifier } from '@/app/platform/instantiation/common/instantiation';
import { ILogService, now } from '@/app/platform/log/common/log';
import { APP_VERSION, ICreateComponentFactory } from '@/base/platform';
import { ServiceCollection } from '@/app/platform/instantiation/browser/collection';
import { getSingletonServiceDescriptors } from '@/app/platform/instantiation/browser/singleton';
import { IRequestService } from '@/app/platform/request/common/requestService';
import requests from '@/app/code/request/requests';
import { ISessionService } from '@/app/code/session/common/session';
import { translate } from '@/app/code/locales/translate';
import { RouteName } from '@/app/code/vue/route-names';
import { timestamp } from '@/base/string';

console.log(`markybox v${APP_VERSION}`)

class Application {
  public init(services: ServiceCollection): void {
    return this.createServices(services);
  }

  public createServices(services: ServiceCollection): void {
    const singletons = getSingletonServiceDescriptors();
    const instantiationService = services.get(IInstantiationService);

    // Make sure to add all services that use `registerSingleton`
    for (const [id, descriptor] of singletons) {
      instantiationService.createInstance2(descriptor, id);
    }

    void this.createView(services);
  }

  public async createView(services: ServiceCollection): Promise<void> {
    const logService = services.get(ILogService);
    const requestService = services.get(IRequestService);
    const sessionService = services.get(ISessionService);

    requestService.registerRequests(requests);

    try {
      await sessionService.restoreSession();
    } catch (error) {
      //
    }

    const App = (await import('@/app/views/App.vue')).default;
    const router = (await import('@/app/views/router/router')).default;
    const app = createApp(App).use(router);

    this.defineGlobalAppVariable(app)

    app.mount('#app');

    logService.info(`App started at: ${now()}`);
  }

  private defineGlobalAppVariable(app: App): void {
    app.config.globalProperties.$t = translate;
    app.config.globalProperties.$timestamp = timestamp;
    app.config.globalProperties.$RouteName = RouteName;
  }
}

function main() {
  const instantiationService = appServices.get(IInstantiationService);

  const workbench: ICreateComponentFactory = {
    createComponent(fn, ...args) {
      return instantiationService.invokeFunction(fn, ...args);
    },
    getService<T>(id: IServiceIdentifier<T>): T {
      return instantiationService.invokeFunction((accessor => accessor.get(id)));
    }
  };

  window.workbench = workbench;

  const app = new Application();

  app.init(appServices)
}

main();
