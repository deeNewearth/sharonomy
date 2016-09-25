'use strict';
var React = require('react');
var Glyphicon = require('react-bootstrap').Glyphicon;

var apiService = require('../js/apiService');
var openchain = require('openchain');
var ByteBuffer = require("protobufjs").ByteBuffer;
var bitcore = require("bitcore-lib");
var moment = require('moment');

var RSVP = require('RSVP');


function _arrayBufferToBinaryString(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    
    return binary;
}

function decodeTransaction(data) {
    return new RSVP.Promise(function (resolve, reject) {
        var t1 = _arrayBufferToBinaryString(data);
        var buffer = ByteBuffer.fromBinary(t1);
        var transaction = openchain.Schema.Transaction.decode(buffer.clone());
        var mutation = openchain.Schema.Mutation.decode(transaction.mutation.clone());

        var transactionBuffer = new Uint8Array(buffer.toArrayBuffer());
        var transactionHash = bitcore.crypto.Hash.sha256(
            bitcore.crypto.Hash.sha256(transactionBuffer));
        var mutationBuffer = new Uint8Array(transaction.mutation.toArrayBuffer());
        var mutationHash = bitcore.crypto.Hash.sha256(
            bitcore.crypto.Hash.sha256(mutationBuffer));


        var trRet = {
            mutation_hash: ByteBuffer.wrap(mutationHash).toHex(),
            transaction_hash: ByteBuffer.wrap(transactionHash).toHex(),
            date: moment(transaction.timestamp.toString(), "X").format("MMMM Do YYYY, hh:mm:ss"),
            mutation: {
                namespace: mutation.namespace.toHex(),
                metadata: mutation.metadata.toHex(),
                records: mutation.records.map(function (record) {
                    var recRet = {
                        key: openchain.RecordKey.parse(record.key),
                        version: record.version
                    };

                    if (recRet.key.recordType == "ACC") {
                        recRet.value = record.value == null ? null : openchain.encoding.decodeInt64(record.value.data);
                    } else if (recRet.key.recordType == "DATA") {
                        recRet.value = record.value == null ? null : openchain.encoding.decodeString(record.value.data);
                    }

                    return recRet;
                })
            },
            transaction_metadata: transaction.transaction_metadata.toHex(),
        };
    });
}

module.exports = React.createClass({
    getInitialState() {
        return {}
    },
    componentWillMount () {

        var me = this;
        apiService.ensureAPIClient()

        .then(function (apiClent) {

            var ocSite = apiClent.endPoint.replace('http://', 'es://').replace('https://', 'ws://');
            me.ws = new WebSocket('ocSite' + 'stream');
            me.ws.binaryType = "arraybuffer";

            me.ws.onmessage = function (evt) {
                
                var tr = decodeTransaction(evt.data);
            };
            /*ws.onclose = function () {
                // websocket is closed.
            };*/

        })

        .then(function (stream) {
        })

        .catch(function (err){
        });
    },

    componentWillUnmount() {
        me.ws.close();
    },

    render() {
        return (
        <div>
            recent transactions


        </div>
        );
    }
});