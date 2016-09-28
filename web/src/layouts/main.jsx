'use strict';
var React = require('react');
var LinkReact = require('react-router').Link;
var CommunityBanner = require('../components/communityBanner');
var apiService = require('../js/apiService');
var Navbar = require('react-bootstrap').Navbar;
var Glyphicon = require('react-bootstrap').Glyphicon;
var LinkContainer = require('react-router-bootstrap').LinkContainer;

var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var apiService = require('../js/apiService');
var Signin = require('../signin');
var PubSub = require('pubsub-js');

module.exports = React.createClass({
    getInitialState() {
        return {};
    },
    componentDidMount () {
        var me = this;
        this.pubSub_SIGNEDIN_token = PubSub.subscribe('SIGNEDIN', function (msg, data) {
            me.setState({ signedIn: true });
        });
        this.pubSub_SIGNEDOUT_token = PubSub.subscribe('SIGNEDOUT', function (msg, data) {
            me.setState({ signedIn: false });
        });

        //do a soft sign in
        apiService.getcredsAync(true);

    },
    componentWillUnmount() {
        PubSub.unsubscribe(this.pubSub_SIGNEDIN_token);
        PubSub.unsubscribe(this.pubSub_SIGNEDOUT_token);
    },
    render() {
        return (
            <div>
                <Navbar >
                  <Navbar.Header>
                    <Navbar.Brand>
                            <a href="#">Sharonomy</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                  </Navbar.Header>

                  <Navbar.Collapse>
                    <Nav pullRight>
                       
                         <LinkContainer to="/issue">
                            <NavItem eventKey={1} >Issue</NavItem>
                        </LinkContainer>
                        {
                            this.state.signedIn?
                                <NavItem eventKey={2} onClick={apiService.signOut}>
                                        <Glyphicon glyph="log-out" /> Sign out</NavItem>
                                :
                                <NavItem eventKey={2} onClick={apiService.getcredsAync.bind(null, false)}>
                                       <Glyphicon glyph="log-in" /> Sign in</NavItem>
                        }
                        
                        
                    </Nav>
                  </Navbar.Collapse>

                </Navbar>

                <h2>Site banner main layout</h2>
                <CommunityBanner data={apiService.getCommunity()}/>
                
                <Signin/>

                {this.props.children}
            </div>
            );
    }
});
