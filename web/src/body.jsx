'use strict';

var React = require('react');
var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Column = require('react-bootstrap').Col;
var Label = require('react-bootstrap').Label;
var Drpme = require('./components/inputDropDown');
var _ = require('lodash');
var RSVP = require('rsvp');

module.exports = React.createClass({
    tg: 21,
    SearchQuery(h) {
        return new RSVP.Promise(function (resolve, reject) {
             
        });
        
    },
    render: function() {
        return (
            <Grid>
                <Row>
                    <Column md={4}>
                        col1
                    </Column>
                    <Column md={8}>
                        <Drpme SearchQuery={this.SearchQuery}>
                            <Label>New {this.tg}</Label>
                            
                        </Drpme>
                    </Column>
                </Row>
            </Grid>
        );
    }
});