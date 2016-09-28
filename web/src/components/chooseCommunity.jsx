'use strict';
var React = require('react');
var InputGroup = require('react-bootstrap').InputGroup;
var Button = require('react-bootstrap').Button;

var DropdownInput = require('./inputDropDown');
var CommunityBanner = require('./CommunityBanner');
var RSVP = require('RSVP');
var request = require('superagent');

var EditCommunity = require('./editCommunity');
var apiService = require('../js/apiService');




module.exports = React.createClass({
    getInitialState() {
        return {}
    },
    componentWillMount () {

        if (typeof (localStorage) !== "undefined") {
            var stored = localStorage.getItem("myCommunity");
            if (stored) {
                var e = JSON.parse(stored);
                if (e) {
                    apiService.setCommunity(e);
                    if (this.props.onSelected)
                        this.props.onSelected(e.handle);
                }
                    
            }
        }
    },
    onSelected(e) {

        if (typeof (localStorage) !== "undefined") {
            localStorage.setItem("myCommunity", JSON.stringify(e));
        }

        apiService.setCommunity(e);
        if (this.props.onSelected)
            this.props.onSelected(e.handle);
    },

    fetchCommunities(pattern) {
        return new RSVP.Promise(function (resolve, reject) {
            if (!pattern) {
                resolve(null);
                return;
            }
            request
            .get('/api/Community/' + pattern)
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (err)
                    reject(err);
                else
                    resolve(res.body);
            });

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
                {
                this.state.newCommunity ?
                <div style={{position:'relative'}}>
                    <h2>Create new Time Bank</h2>
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
                            <CommunityBanner/>
                        </DropdownInput>
                    </InputGroup>
                    <Button bsStyle="link" onClick={this.onNewCommunity}>
                        Click here if you have been invited to create a new community
                    </Button>
                </div>
                }
            </div>
            );
    }
});