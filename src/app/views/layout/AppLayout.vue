<template>
  <div
    class="m-app"
  >
    <div v-if="isHeaderShown" class="m-app__header">
      <app-header />
    </div>

    <div class="m-app__aside">
      <app-drawer v-if="isDrawerShown" />
    </div>

    <app-bottom-navigation v-if="isMobile" />

    <div class="m-app__modal">
      <app-modal />
      <component :is="currentModal"></component>
    </div>

    <div class="m-app__notifications">
      <notification-container />
    </div>

    <div
      class="overlay"
      :class="{ 'overlay--is-visible': isDrawerShown || isOpenModal }"
    />

    <div class="m-app__body" id="scroll-container">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import UserLoginModal from '@/app/views/modals/UserLoginModal.vue';
import UserProfileModal from '@/app/views/modals/UserProfileModal.vue';
import EnterNameModal from '@/app/views/modals/EnterNameModal.vue';
import { ILayoutService } from '@/app/platform/layout/common/layout';

const layoutService = window.workbench.getService(ILayoutService);
const { isOpen: isOpenModal, currentModal } = layoutService.modal;

export default { name: 'AppLayout', components: { UserLoginModal, UserProfileModal, EnterNameModal } };
</script>

<script lang="ts" setup>
import AppHeader from '@/app/views/components/AppHeader.vue';
import AppDrawer from '@/app/views/components/AppDrawer.vue';
import AppBottomNavigation from '@/app/views/components/AppBottomNavigation.vue';
import AppModal from '@/app/views/components/AppModal.vue';
import NotificationContainer from '@/app/views/components/notification/NotificationContainer.vue';

import useDrawer from '@/app/views/composables/use-drawer';
import useHeader from '@/app/views/composables/use-header';
import { inject } from 'vue';

const { isDrawerShown } = useDrawer();
const { isHeaderShown } = useHeader();

const isMobile = inject<boolean>('isMobile');
</script>

<style lang="sass">
.m-app
  display: flex
  flex-direction: column
  position: fixed
  flex-grow: 1
  max-height: 100%
  top: 0
  left: env(safe-area-inset-left, 0)
  right: env(safe-area-inset-right, 0)
  bottom: 0
  overflow: hidden

  &__header
    top: 0

  &__body
    display: flex
    flex-direction: column
    flex-grow: 1
    overflow-x: hidden
    overflow-y: scroll

  &__aside
    transform: translateX(-100%)
    will-change: transform
    transition: transform .3s
    z-index: var(--z-index-app-aside)
    position: absolute
    top: 0
    bottom: 0
    left: 0
    right: 0


.app_has-drawer .m-app__aside
  transform: translateX(0)
</style>
