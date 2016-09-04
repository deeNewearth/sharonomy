var React = require('react');
var ReactDOM = require('react-dom');
require('bootstrap/dist/css/bootstrap.css');
require('./assets/font-awesome-4.6.3/css/font-awesome.css');
var PrimaryContent = require('./editCommunity');

var apiService = require('./services/apiService');
var Signin = require('./signin');

var Wrapper = React.createClass({
    getChildContext() {
        return {
            color: "purple",
            connector:apiService
        };
    },
    childContextTypes: {
        color: React.PropTypes.string,
        connector: React.PropTypes.object
    },

    render: function() {
        return (
    <div>
        <h1>Hello, jsx! 9</h1>
        <Signin/>
        <PrimaryContent />
    </div>
        );
}
});

ReactDOM.render(<Wrapper/>,
    document.getElementById('theApp')
);