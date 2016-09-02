'use strict';

var React = require('react');
var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Column = require('react-bootstrap').Col;

module.exports =React.createClass({
    render: function() {
        return (
            <Grid>
                <Row>
                    <Column md={4}>
                        col1
                    </Column>
                    <Column md={8}>
                        col3
                    </Column>
                </Row>
            </Grid>
        );
    }
});