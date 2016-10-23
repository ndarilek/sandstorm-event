import "bootstrap/dist/css/bootstrap.css"

import ApolloClient from "apollo-client"
import BootstrapVue from "bootstrap-vue"
import {Vue} from "meteor/akryum:vue"
import {Meteor} from "meteor/meteor"
import VueApollo from "vue-apollo"
import {meteorClientConfig} from "meteor/apollo"

import App from "./app.vue"

Vue.use(BootstrapVue)

apolloClient = new ApolloClient(meteorClientConfig())
import gql from "graphql-tag"
window.gql = gql

Vue.use(VueApollo, {
  apolloClient
})

Meteor.startup(() => {
  new Vue({
    el: "#app",
    render: h => h(App)
  })
})
