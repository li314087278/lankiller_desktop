<template>
  <div id="app">
    <!--<landing-page></landing-page>-->
      <MainPage></MainPage>
  </div>
</template>

<script>
  import  MainPage from '@/view/MainPage';

  export default {
    name: 'lancut',
    components: {MainPage}
  }
</script>

<style>
      html,body {
          margin: 0px;
          width: 100%;
          height: 100%;
          overflow: hidden;
      }
    #app{
        width: 100%;
        height: 100%;
    }
</style>
