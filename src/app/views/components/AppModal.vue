<template>
  <div class="modal" :class="{ 'modal--is-visible': isOpenModal }">
    <div class="modal__content">
      <div class="modal__container">
        <header class="modal__header">
          <h3 class="modal__title"></h3>
          <button class="modal__close" type="button" @click="closeModal()"></button>
        </header>
        <div class="modal__main" id="modal-app">

        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue';
import { ILayoutService } from '@/app/platform/layout/common/layout';

export default window.workbench.createComponent((accessor) => {
  const layoutService = accessor.get(ILayoutService);

  return defineComponent({
    name: 'AppModal',
    setup() {
      const { isOpen: isOpenModal } = layoutService.modal

      function closeModal(): void {
        layoutService.modal.close();
      }

      function onEscape(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
          closeModal();
        }
      }

      window.addEventListener('keyup', onEscape);

      onUnmounted(() => {
        window.removeEventListener('keyup', onEscape);
      })

      return { isOpenModal, closeModal }
    },
  })
})
</script>

<style lang="sass">

.modal
  -webkit-overflow-scrolling: touch
  overflow: auto
  position: fixed
  top: 0
  bottom: 0
  left: 0
  right: 0
  padding-top: 50px
  padding-bottom: 50px
  z-index: var(--z-index-modal-layer)
  display: none

  &--is-visible
    display: block

.modal__header
  min-height: 40px
  display: flex
  flex-direction: row
  align-items: center
  justify-content: space-between
  background-color: var(--foreground-default)

.modal__title
  margin: 0
  padding: 0
  font-size: 1.35rem
  font-weight: lighter
  color: var(--accent-blurple-dimmer)
  line-height: 2.1
  text-align: left
  padding-left: 12px
  padding-top: 4px

.modal__close
  background: none
  border: none
  font-size: 0
  width: 18px
  height: 18px
  margin: 0
  padding: 0
  right: 8px
  outline-color: var(--foreground-default)
  top: 11px
  position: absolute
  cursor: pointer
  display: block

  &::before
    content: ""
    position: absolute
    width: 18px
    height: 7px
    background-color: var(--accent-blurple-dimmer)
    top: 6px
    left: 0
    transform: rotate(45deg)

  &::after
    content: ""
    position: absolute
    width: 18px
    height: 7px
    background-color: var(--accent-blurple-dimmer)
    bottom: 5px
    left: 0
    transform: rotate(135deg)

.modal__container
  position: sticky
  max-width: 800px
  width: 100%
  margin: 0 auto
  padding-bottom: 50px
  color: var(--accent-blurple-dimmer)

.modal__content
  height: 100%
  margin: 0 auto

.modal__main
  background: var(--root-color)
  padding: 20px
</style>
