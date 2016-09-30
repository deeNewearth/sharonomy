'use strict';
var React = require('react');
var LinkReact = require('react-router').Link;

var apiService = require('../js/apiService');
var Navbar = require('react-bootstrap').Navbar;
var Glyphicon = require('react-bootstrap').Glyphicon;
var LinkContainer = require('react-router-bootstrap').LinkContainer;

var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var NavDropdown = require('react-bootstrap').NavDropdown;
var apiService = require('../js/apiService');
var Signin = require('../signin');
var PubSub = require('pubsub-js');
var Image = require('react-bootstrap').Image;

module.exports = React.createClass({
    getInitialState() {
        return { navExpanded: false };
    },
    onNavItemClick(action){
        this.setState({ navExpanded: false });
        if (action && action.funcCall)
            action.funcCall();
    },
    onNavbarToggle(){
        this.setState({ navExpanded: ! this.state.navExpanded });
    },
    componentDidMount () {
        var me = this;
        this.pubSub_SIGNEDIN_token = PubSub.subscribe('SIGNEDIN', function (msg, data) {
            me.setState({ myCreds: data });
        });
        this.pubSub_SIGNEDOUT_token = PubSub.subscribe('SIGNEDOUT', function (msg, data) {
            me.setState({ myCreds: null });
        });

        //do a soft sign in
        apiService.getcredsAync(true);

    },
    componentWillUnmount() {
        PubSub.unsubscribe(this.pubSub_SIGNEDIN_token);
        PubSub.unsubscribe(this.pubSub_SIGNEDOUT_token);
    },
    render() {
        var community = apiService.getCommunity();
        var dopdownmenuTitle = this.state.myCreds && this.state.myCreds.decoded.ACC ?
                                <span>
                                {
                                    this.state.myCreds.avatar ?
                                    
                                            <Image style={{ height: '30px', float: 'left',marginTop: '-4px' }}
                                                    src={this.state.myCreds.avatar} circle/>
                                            :<i className="fa fa-user"></i>
                                }
                                {this.state.myCreds.decoded.unique_name}
                                </span>:'';
        return (
            <div>
                <Navbar expanded={ this.state.navExpanded } onToggle={ this.onNavbarToggle }>
                  <Navbar.Header>
                    <Navbar.Brand>
                            <LinkReact to={'/' }
                                        style={{maxWidth: '250px',maxHeight: '50px',overflow: 'hidden'}}
                               >{community?community.handle:''}</LinkReact>
                    </Navbar.Brand>
    
                      <Navbar.Toggle />

                      
                  </Navbar.Header>

                    

                  <Navbar.Collapse>

                    <Nav pullRight>

                        {
                            this.state.myCreds && this.state.myCreds.decoded.ACC ?
                            <NavDropdown eventKey={4} title={dopdownmenuTitle} id="basic-nav-dropdown">

                                <LinkContainer to="/issue">
                                    <NavItem onClick={ this.onNavItemClick } eventKey={4.1} >Issue</NavItem>
                                </LinkContainer>

                                <NavItem eventKey={4.2} 
                                             onClick={this.onNavItemClick
                                                     .bind(null, { funcCall: apiService.signOut })}>
                                        <Glyphicon glyph="log-out" /> Sign out
                                </NavItem>

                            </NavDropdown>
                            :
                            (
                                
                                this.state.myCreds ?
                                <NavItem eventKey={2} onClick={this.onNavItemClick
                                    .bind(null, { funcCall: apiService.signOut })}>
                                        <Glyphicon glyph="log-out" /> Sign out</NavItem>
                                :
                                <NavItem eventKey={2} 
                                   onClick={this.onNavItemClick
                                    .bind(null, { funcCall: apiService.getcredsAync.bind(null, false)})}>
                                       <Glyphicon glyph="log-in" /> Sign in</NavItem>

                            )
                            
                        }


                        
                    </Nav>
                  </Navbar.Collapse>


                </Navbar>

                
                
                
                <Signin/>

                {this.props.children}
            </div>
            );
    }
});
