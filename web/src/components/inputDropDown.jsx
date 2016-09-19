'use strict';

var _ = require('lodash');
var React = require('react');
var ReactDOM = require('react-dom');
var Dropdown = require('react-bootstrap').Dropdown;
var FormControl = require('react-bootstrap').FormControl;
var MenuItem = require('react-bootstrap').MenuItem;
var Button = require('react-bootstrap').Button;


var CustomToggle = React.createClass({
    getInitialState() {
        var me = this;
        if (this.props.setCloseCB) {
            this.props.setCloseCB(function () {
                if (me.props.open)
                    me.props.onClick();
            });
        }
        return { pattern: '' };
    },
    onChange(e) {
        e.preventDefault();
        
        if(!this.props.open)
            this.props.onClick(e);
    
        if (this.props.onSearchChanged)
            this.props.onSearchChanged(e.target.value);
        this.setState({ 'pattern': e.target.value });

    },
    render: function() {
        return (<FormControl type="text" onChange={this.onChange} 
                             className="large_screenmin350"
                             value={this.state.pattern}
                             style={{borderRadius:0}}
                          placeholder={this.props.placeholder}/>
     )}
});

var CustomMenu = React.createClass({
    render() {
        return (
          <div className="dropdown-menu" style={{ padding: '' }}>
                <ul className="list-unstyled" >
                    {this.props.children}
                </ul>
          </div>
        );
    }
});

module.exports = React.createClass({
    getInitialState() {
        return { results: [] };
    },

    onBlur(e) {
        var me = this;
        //need the delay so that the menu onSelect can be triggered
        _.delay(function () {
            if (me.closeCB)
                me.closeCB();
        },100);
        
    },
    //used to set callback that is used to close the toggle 
    callCloseCB(closeCB) {
        this.closeCB = closeCB;
    },

    //the text input lets this now that new search is to be done
    onSearchChanged(value) {
        //this is a method call returning a promise
        if (this.props.SearchQuery) {

            if (!this.debouncedFetch) {
                var me = this;

                this.debouncedFetch = _.throttle(function (pattern) {
                    let thisSearchID = new Date().getTime();
                    me.lastSearchId = thisSearchID;
                    me.props.SearchQuery(pattern)
                    .then(function (results) {
                        if (me.lastSearchId !== thisSearchID)
                            return; //stale search
                    }, function (err) {
                        if (me.lastSearchId !== thisSearchID)
                            return; //stale search
                    });
                },2000, {
                    'leading': false,
                    'trailing': true
                });

            }

            this.debouncedFetch(value);
        }
    },
    
    onSelect(key,e) {
        var t = 3;
    },
    render: function () {
        
        return (
    
        <Dropdown id="dropdown-custom-menu" onBlur={this.onBlur}
                  style={{width:"100%"}}>
            
            <CustomToggle bsRole="toggle" placeholder={this.props.placeholder}
                          setCloseCB={this.callCloseCB} onSearchChanged={this.onSearchChanged}/>

            <CustomMenu bsRole="menu">
              <MenuItem onSelect={this.onSelect}
                        eventKey="1">{React.cloneElement(this.props.children, { bsStyle: 'danger' })}</MenuItem>
              <MenuItem onSelect={this.onSelect}
                        eventKey="2">1{this.props.children}</MenuItem>
              <MenuItem eventKey="3" active>2</MenuItem>
              <MenuItem eventKey={1} >
        link that alerts
      </MenuItem>
            </CustomMenu>
          </Dropdown>
    );
    }
});

    