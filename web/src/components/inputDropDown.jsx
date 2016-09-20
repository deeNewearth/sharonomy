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
        return { results: null};
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
                        
                        me.setState({ results: results, fethcingData: false });

                    }, function (err) {
                        if (me.lastSearchId !== thisSearchID)
                            return; //stale search
                        this.setState({ fethcingData: false, fetchError: 'lookup failed' });
                    });
                },500, {
                    'leading': false,
                    'trailing': true
                });

            }

            this.setState({ fethcingData: true, fetchError: null  });
            this.debouncedFetch(value);
        }
    },
    
    onSelect(key) {
        if (this.props.onSelected)
            this.props.onSelected(this.state.results[key]);
    },
    render: function () {
        var me = this;
        return (
        <Dropdown id="dropdown-custom-menu" onBlur={this.onBlur}
                  style={{width:"100%"}}>
            
            <CustomToggle bsRole="toggle" placeholder={this.props.placeholder}
                          setCloseCB={this.callCloseCB} onSearchChanged={this.onSearchChanged}/>

            <CustomMenu bsRole="menu">
                {
                this.state.fethcingData?
                    <div className="text-muted">
                        <i className="fa fa-cog fa-spin" style={{marginRight:'5px'}}></i>Looking up...
                    </div>
                    :''
                }

                <span className="text-danger">{this.state.fetchError}</span>

                {
                    this.state.results && this.state.results.length == 0 ?
                    <div className="text-warning">No matches found</div>:''
                }
                
                {
                    this.state.results?
                        this.state.results.map(function (rec, i) {
                            return(
                            <MenuItem onSelect={me.onSelect} key={i} eventKey={i}>
                                {React.cloneElement(me.props.children, { data: rec })}
                            </MenuItem>
                                  );
                            }):''
                }
            </CustomMenu>
        </Dropdown>
    );
    }
});

    