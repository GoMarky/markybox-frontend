<template>
  <div class="page_sandbox">
    <section class="sandbox">
      <article class="sandbox__item">
        <div id="editor-big"></div>
      </article>
      <article class="sandbox__item">
        <div id="editor-small"></div>
      </article>
      <article class="sandbox__item">
        <div id="editor-readonly"></div>
      </article>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { HTMLRenderer } from '@gomarky/markybox-core';

const editorBig = new HTMLRenderer();
const editorSmall = new HTMLRenderer({
  mode: 'embed',
  name: 'small',
  width: 600,
  height: 400,
  fullscreen: false,
});
const editorReadonly = new HTMLRenderer({
  mode: 'embed',
  name: 'readonly',
  width: 600,
  height: 200,
});

onMounted(() => {
  editorSmall.mount('#editor-small');

  editorReadonly.mount('#editor-readonly');
});
</script>

<style lang="sass">
.sandbox
  &__item
    margin-top: 40px
</style>
