<template>
  <div class="container-fluid">
    <h1>{{ title }}</h1>
  </div>
</template>
<script>
  import gql from "graphql-tag"

  export default {
    data: () => ({
      title: ""
    }),
    apollo: {
      title: {
        query: gql`{
          event {
            title
          }
        }`
      }
    }
  }
</script>
