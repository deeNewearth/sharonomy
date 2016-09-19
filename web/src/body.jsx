'use strict';

var React = require('react');
var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Column = require('react-bootstrap').Col;

var Avatar = require('./components/avatar/avatar');





module.exports = React.createClass({
    
    
    render: function() {
        return (
            <div>
                hi body
                
                <Avatar/>  
                
            </div>
        );
    }
});