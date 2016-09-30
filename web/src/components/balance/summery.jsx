'use strict';
var React = require('react');
var apiService = require('../../js/apiService');
var Loader = require('../loader');
var RSVP = require('rsvp');
var _ = require('lodash');
var Glyphicon = require('react-bootstrap').Glyphicon;
var LinkReact = require('react-router').Link;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;


module.exports = React.createClass({
    getInitialState() {
        return {}
    },
    componentWillMount() {
        var me = this;

        RSVP.hash({
            creds: apiService.getcredsAync(),
            apiClent: apiService.ensureAPIClient()
        })

        
        .then(function (results) {
            var key = '/aka/' + results.creds.decoded.unique_name + '/:ACC:' + apiService.getAssetName();
            //var t = openChain.encoding.encodeString(key);

            return results.apiClent.getAccountRecords('/aka/' + results.creds.decoded.unique_name + '/');
        })

        .then(function (records) {
            var hourAsset = _.find(records, function (r) { return r.asset === apiService.getAssetName(); });
            if (!hourAsset)
                throw { message: 'no assets found' };
            me.setState({ balance: hourAsset.balance });
        })

        .catch(function (err) {
            me.setState({ error: 'Failed to load summery :' + err.message });
        })
        .finally(function () {
            me.setState({ loaded: true});
        });
    },

    render() {
        const detailsTooltip = (
            <Tooltip id="detailsTooltip">Show transaction history</Tooltip>
        );

        return (
            <Loader loaded={this.state.loaded}>
                <div>
                    Current balance : <strong>{this.state.balance}</strong> hour(s)
                    
                    <LinkReact to={'/txhistory' }>
                        <OverlayTrigger placement="bottom" overlay={detailsTooltip}>
                            <Glyphicon glyph="list-alt" />
                        </OverlayTrigger>
                   </LinkReact>
                </div>

                <span className="text-danger">{this.state.error}</span>
            </Loader>
            );
    }
});