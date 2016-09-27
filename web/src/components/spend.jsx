'use strict';
var React = require('react');
var apiService = require('../js/apiService');


module.exports = React.createClass({
    
    componentWillMount () {
        apiService.getcredsAync();
    },

    render() {
        return (
            <div>
                <h2>Spendit</h2>
            </div>
            );
    }
});