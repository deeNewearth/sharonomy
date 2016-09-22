'use strict';
var openChain = require('openchain');
var RSVP = require('rsvp');
var PubSub = require('pubsub-js');

var _rootKey = null;
var _apiClientPromise = null;
var _Community = null;

module.exports = {
    setCommunity(c) {
        _Community = c;
    },
    getCommunity(){return _Community;},
    getCommunityHandle() { return _Community.handle; },
    getAssetName() { return '/asset/' + _Community.handle + '_hours/'; },
    getTreasuryAccount() { return '/treasury/' + _Community.handle + '_hours/'; },
    ensureAPIClient() {

        if (!_apiClientPromise) {
            _apiClientPromise = new RSVP.Promise(function (resolve, reject) {
                var apiClient = new openChain.ApiClient(_Community.ocUrl);
                apiClient.initialize()
                .then(function (success) {
                    resolve(apiClient);
                }, function (fail) {
                    reject(fail);
                });
            });
        }

        return _apiClientPromise;
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
    }
    
    
};