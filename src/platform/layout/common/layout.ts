import { createDecorator } from '@/platform/instantiation/common/instantiation';
import { Disposable } from '@/platform/lifecycle/common/lifecycle';
import { Ref, ref } from 'vue';

export const ILayoutService = createDecorator<ILayoutService>('layoutService');

type ModalName = 'UserLoginModal' | 'UserProfileModal'

export class ModalController extends Disposable {
  public readonly isOpen: Ref<boolean> = ref(false);

  public readonly currentModal: Ref<string> = ref('');

  public open(modalName: ModalName): void {
    this.currentModal.value = modalName;
    this.isOpen.value = true;
  }

  public close(): void {
    this.currentModal.value = '';
    this.isOpen.value = false;
  }
}

export interface ILayoutService {
  readonly modal: ModalController;
}
