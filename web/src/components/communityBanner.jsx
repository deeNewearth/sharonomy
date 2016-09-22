'use strict';
var React = require('react');


module.exports = React.createClass({
    

    render() {
        return (
            <div>
                <h2>{this.props.data.full_name}</h2>
            </div>
            );
    }
});