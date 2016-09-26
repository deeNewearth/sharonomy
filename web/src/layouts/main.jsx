'use strict';
var React = require('react');
var LinkReact = require('react-router').Link;
var CommunityBanner = require('../components/communityBanner');
var apiService = require('../js/apiService');
var Navbar = require('react-bootstrap').Navbar;
var LinkContainer = require('react-router-bootstrap').LinkContainer;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var apiService = require('../js/apiService');


module.exports = React.createClass({
    render() {
        return (
            <div>
                <Navbar>
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

                        <NavItem eventKey={2} onClick={apiService.signOut}>Sign out</NavItem>
                        
                    </Nav>
                  </Navbar.Collapse>

                </Navbar>

                <h2>Site banner main layout</h2>
                <CommunityBanner data={apiService.getCommunity()}/>
                
                {this.props.children}
            </div>
            );
    }
});
