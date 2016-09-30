'use strict';
var React = require('react');

module.exports = React.createClass({
    getInitialState() {
        return { loaded: this.props.loaded };
    },
    componentWillReceiveProps: function (nextProps) {
        var t = !!nextProps.loaded;
        this.setState({ loaded: t });
    },

    render() {
        return (this.state.loaded ?<div>{this.props.children}</div>:
                    <h3 className="text-center text-muted"
                        style={{ position: 'absolute',zIndex: 10,width: '100%'}}
                        >
                        <i className="fa fa-cog fa-spin" style={{ marginRight: '5px' } }></i>Loading...
                    </h3>
            );
    }
});