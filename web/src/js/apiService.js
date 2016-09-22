'use strict';
var openChain = require('openchain');
var RSVP = require('rsvp');
var PubSub = require('pubsub-js');

var _rootKey = null;
var _apiClientPromise = null;

//const _communityOcUrl = 'http://localhost:63154/';
const _communityOcUrl = 'http://localhost:8090/site1';
const _CommunityHandle = 'san_marcos_lake_atitlan';
const _theAsset = '/asset/san_marcos_hours/';


module.exports = {
    getCommunityHandle() { return _CommunityHandle; },
    getAssetName() { return _theAsset; },
    ensureAPIClient() {

        if (!_apiClientPromise) {
            _apiClientPromise = new RSVP.Promise(function (resolve, reject) {
                var apiClient = new openChain.ApiClient(_communityOcUrl);
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