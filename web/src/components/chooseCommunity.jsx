'use strict';
var React = require('react');
var InputGroup = require('react-bootstrap').InputGroup;
var Button = require('react-bootstrap').Button;

var DropdownInput = require('./inputDropDown');
var CommunityBanner = require('./CommunityBanner');

var request = require('superagent');
var withsupererror = require('../js/withsupererror');

var EditCommunity = require('./editCommunity');
var apiService = require('../js/apiService');

var Signin = require('../signin');

var CommunityTemplate = React.createClass({
    render() {
        return (
        <div>{this.props.data.full_name}</div>
        );
    }
});

module.exports = React.createClass({
    getInitialState() {
        return {}
    },
    componentWillMount () {
        var me = this;

        if (typeof (localStorage) !== "undefined") {
            var stored = localStorage.getItem("myCommunity");
            if (stored) {
                return request.get('/api/Community/handle/' + stored)
                .set('Accept', 'application/json')
                .use(withsupererror).end()
                .then(function (result) {
                    me.onSelected(result.body);
                })
                .catch(function () {
                    me.setState({ showChooser: true });
                })

                ;

                
            }
        }
        me.setState({ showChooser: true });
    },
    onSelected(community) {

        if (typeof (localStorage) !== "undefined") {
            localStorage.setItem("myCommunity", community.handle);
        }

        apiService.setCommunity(community);
        if (this.props.onSelected)
            this.props.onSelected(community.handle);
    },

    fetchCommunities(pattern) {

        return request
            .get('/api/Community/' + pattern)
            .set('Accept', 'application/json')
            .use(withsupererror).end()
            .then(function (res) {
                return res.body;
            });
    },

    onNewCommunity() {
        this.setState({ newCommunity: true });
    },
    onEditCOmmunityCancel() {
        this.setState({ newCommunity: false });
    },

    render() {
        return (
            <div className="container">
                <Signin/>
                {
                    this.state.showChooser?
                    <div>
{
                this.state.newCommunity ?
                <div style={{position:'relative'}}>
                    <h2  className="text-center">Create new Time Bank</h2>
                    <EditCommunity 
                              onCancel={this.onEditCOmmunityCancel}
                              onDone={this.onSelected}/>
                </div>
                :
                
                <div className="text-center" style={{ marginTop: '50px'}}>
                    <InputGroup>
                        <InputGroup.Addon>
                            <i className="fa fa-users"></i>
                        </InputGroup.Addon>
                        
                        <DropdownInput placeholder="Search for your community"
                                       onSelected={this.onSelected}
                                       SearchQuery={this.fetchCommunities}>
                            <CommunityTemplate/>
                        </DropdownInput>
                    </InputGroup>
                    <Button bsStyle="link" onClick={this.onNewCommunity}>
                        <span>Click here if you have been invited to create a new community</span>
                    </Button>
                </div>
                }
                    </div>
                    :
                    <h1 className="text-center text-muted"
                        style={{ position: 'absolute',zIndex: 10,width: '100%'}}
                        >
                        <i className="fa fa-cog fa-spin" style={{ marginRight: '5px' } }></i>Loading...
                    </h1>
                }
                
            </div>
            );
    }
});