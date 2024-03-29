<template>
  <header class="page-header">
    <div class="page-header__menu" @click="openDrawer()">
      <icon-burger-menu />
    </div>
    <router-link :to="{ name: 'HomePage' }" class="page-header__logo">
      <div class="page-header__logo-wrapper">
        <img class="page-header__logo-image" :src="require('@/app/assets/gomarky-logo.png').default">
      </div>
      <div class="page-header__logo-title">
        markybox
      </div>
    </router-link>
    <nav class="page-header__navigation">
      <ul class="page-header__nav-list">
        <li class="page-header__nav-item" v-if="isNotePage">
          <UISelect label="Lang" :value="currentEditorLang" @update:value="setEditorLang"
                    :options="editorLanguages"></UISelect>
        </li>
        <li class="page-header__nav-item">
          <button type="button" class="btn btn_primary page-header__nav-link">
            <icon-settings />
          </button>
        </li>
        <li class="page-header__nav-item" v-if="isNotePage">
          <button type="button" @click.prevent="copyNoteLink()" class="btn btn_primary page-header__nav-link">
            <icon-share />
          </button>
        </li>
        <li class="page-header__nav-item">
          <button @click.prevent="isAuth ? openUserProfileModal() : openLoginModal()" type="button"
                  class="btn btn_primary page-header__nav-link">
            <icon-profile />
          </button>
        </li>
        <li v-if="!isAuth" class="page-header__nav-item">
          <router-link :to="{ name: $RouteName.RegistrationPage }" type="button"
                       class="btn btn_primary page-header__nav-link">
            {{ $t('header.registration.title') }}
          </router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { ISessionService } from '@/app/code/session/common/session';
import { ILayoutService } from '@/app/platform/layout/common/layout';
import { INoteService } from '@/app/code/notes/common/notes';
import { Mime } from '@/base/string';
import { useNotifications } from '@/app/views/components/notification/use-notifications';
import useDrawer from '@/app/views/composables/use-drawer';
import useCurrentEditorNoteLang from '@/app/views/composables/use-current-editor-note-lang';
import UISelect from '@/app/views/components/ui/UISelect.vue';
import IconBurgerMenu from '@/app/views/components/icons/IconBurgerMenu.vue';
import IconShare from '@/app/views/components/icons/IconShare.vue';
import IconProfile from '@/app/views/components/icons/IconProfile.vue';
import IconSettings from '@/app/views/components/icons/IconSettings.vue';
import { computed } from '@vue/reactivity';
import { RouteName } from '@/app/code/vue/route-names';
import { getSupportedSyntaxes } from '@gomarky/markybox-core';
import { EditorLang } from '@gomarky/markybox-core/lib/types/common';

export default window.workbench.createComponent((accessor) => {
  const sessionService = accessor.get(ISessionService);
  const layoutService = accessor.get(ILayoutService);
  const noteService = accessor.get(INoteService);

  return defineComponent({
    name: 'AppHeader',
    components: {
      UISelect,
      IconProfile,
      IconSettings,
      IconShare,
      IconBurgerMenu,
    },
    setup() {
      const router = useRouter();
      const { name, isAuth } = sessionService.profile;
      const { addNotification } = useNotifications();
      const { openDrawer } = useDrawer();
      const { currentEditorLang, setEditorLang } = useCurrentEditorNoteLang();

      const editorLanguages: EditorLang[] = getSupportedSyntaxes();

      const isNotePage = computed(() => {
        const routeName = router.currentRoute.value.name;

        return routeName === RouteName.NotePage;
      });

      function openUserProfileModal(): void {
        layoutService.modal.open('UserProfileModal');
      }

      function openLoginModal(): void {
        layoutService.modal.open('UserLoginModal');
      }

      async function clearNote(): Promise<void> {
        const noteId = router.currentRoute.value.params.id as string;

        if (noteId) {
          await noteService.updateNote(noteId, '');
          // editorService.renderer.clear();
        }
      }

      async function copyNoteLink(): Promise<void> {
        const link = window.location.href;

        const type: Mime = 'text/plain';
        const blob: Blob = new window.Blob([link], { type });
        const data: ClipboardItem[] = [new ClipboardItem({ [type]: blob })];

        await window.navigator.clipboard.write(data);

        addNotification({
          title: 'Link copied',
          hideAfter: 1500,
        })
      }

      return {
        setEditorLang,
        isNotePage,
        currentEditorLang,
        editorLanguages,
        isAuth,
        name,
        openDrawer,
        openUserProfileModal,
        openLoginModal,
        clearNote,
        copyNoteLink
      }
    },
  })
});
</script>

<style lang="sass" scoped>
.page-header
  display: flex
  flex-direction: row
  overflow: hidden
  height: 40px
  padding: 10px
  flex-shrink: 0
  background-color: var(--background-default)
  align-items: center
  position: sticky
  z-index: var(--z-index-app-header)
  min-height: 40px
  box-sizing: border-box

  &__logo
    margin: 0
    padding: 0
    display: flex
    flex-direction: row
    align-items: center
    margin-right: auto
    font-size: 0
    outline-color: var(--foreground-default)

  &__menu
    display: flex
    font-size: 28px
    cursor: pointer

  &__logo-wrapper
    margin-right: 7px

  &__logo-image
    width: 32px
    height: 32px

  &__logo-title
    margin: 0
    padding: 0
    font-size: 1.125rem
    color: var(--root-color)
    font-weight: bold
    line-height: 1
    text-align: left

.page-header__navigation
  text-align: center
  display: block
  top: 0
  position: static
  background-color: inherit
  padding-top: 0
  flex-basis: 66%
  padding-right: 0.25rem
  width: auto
  margin-left: 35px

.page-header__nav-list
  margin: 0
  padding: 0
  display: flex
  flex-direction: row
  justify-content: flex-end
  margin-left: 3.125%
  margin-right: 3.125%

.page-header__nav-item
  margin: 0
  padding: 0
  list-style: none

  &:last-child
    border-bottom: none

.page-header__nav-link
  display: block
  font-size: 1.5rem
  color: var(--root-color)
  line-height: 1
  text-align: center
  outline-color: var(--foreground-default)
  border-bottom: 2px solid var(--accent-blurple-dimmer)

@media (min-width: var(--endpoint-tablet-width))
  .page-header
    flex-direction: row
    justify-content: space-between

  .page-header__logo
    flex-basis: 20.5%
    flex-grow: 0

  .page-header__nav-item
    border-bottom: none
    margin-right: 1.5rem
    position: relative

  .page-header__nav-link
    font-size: 0.79rem
    line-height: 1

</style>

