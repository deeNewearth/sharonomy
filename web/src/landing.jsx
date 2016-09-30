'use strict';
var React = require('react');
var apiService = require('./js/apiService');
var CommunityBanner = require('./components/communityBanner');
var ShowifSignedin = require('./components/showifSignedin');
var LinkReact = require('react-router').Link;
var BalanceSummery = require('./components/balance/summery');

module.exports = React.createClass({
    render() {
        return (
            <div>
                <CommunityBanner data={apiService.getCommunity()}/>

                bl bl bla

                <ShowifSignedin admin={true}>
                    <LinkReact to={'/issue' }>Issue Hours</LinkReact>
                </ShowifSignedin>


                <ShowifSignedin ACC={true}>
                    <BalanceSummery/>
                </ShowifSignedin>
                

            </div>
            );
}
});