import { Disposable } from '@/platform/lifecycle/common/lifecycle';
import { ILayoutService, ModalController, NotificationController } from '@/platform/layout/common/layout';

export class LayoutService extends Disposable implements ILayoutService {
  public readonly modal: ModalController = new ModalController();
  public readonly notification: NotificationController = new NotificationController();

  constructor() {
    super();
  }
}
