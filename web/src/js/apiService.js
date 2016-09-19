'use strict';
var openChain = require('openchain');
var RSVP = require('rsvp');
var PubSub = require('pubsub-js');

var _rootKey = null;

var _communityOcUrl = 'http://localhost:63154/';
var _apiClient = null;
var _CommunityHandle = 'san_marcos_lake_atitlan';


module.exports = {
    getCommunityHandle(){return _CommunityHandle;},
    ensureAPIClient() {
        if (!_apiClient) {
            _apiClient = new openChain.ApiClient(this.url);
            _apiClient.initialize();
        }
        return _apiClient
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