'use strict';
var openChain = require('openchain');
var RSVP = require('rsvp');
var PubSub = require('pubsub-js');

var _rootKey =null;

module.exports = {
    url: 'http://localhost:63154/',
    apiClient: null,
    ensureAPIClient() {
        if (!this.apiClient) {
            this.apiClient = new openChain.ApiClient(this.url);
            this.apiClient.initialize();
        }
        return this.apiClient
    },
    getKeyAync() {
        var me = this;
        return new RSVP.Promise(function(resolve, reject) {
            if (_rootKey) {
                resolve(_rootKey);
                return;
            }

            PubSub.publish('LOGIN NEEDED', {
                success_callback: function (key) {
                    _rootKey = key;
                    resolve(_rootKey);
                },
                error_callback: function (error) {
                    reject(error);
                }
            });

        });
    },
    update: function () {
        
        var h =this.ensureAPIClient().getInfo().then(function(a,b){
        });
    }
};