'use strict';
var React = require('react');
var LinkReact = require('react-router').Link;
var CommunityBanner = require('../components/communityBanner');
var apiService = require('../js/apiService');

module.exports = React.createClass({
    render() {
        return (
            <div>
                <h2>Site banner main layout</h2>
                <CommunityBanner data={apiService.getCommunity()}/>
                <div>Navigation : <LinkReact to="/edit">edit</LinkReact></div>
                {this.props.children}
            </div>
            );
    }
});
