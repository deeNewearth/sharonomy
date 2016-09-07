var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router').Router;
var Route = require('react-router').Route;
var hashHistory = require('react-router').hashHistory;


require('bootstrap/dist/css/bootstrap.css');
require('./assets/font-awesome-4.6.3/css/font-awesome.css');
require('./assets/customPositions.css');

var editCommunity = require('./editCommunity');
var communityIssue = require('./components/issueHours/issueHours');

var apiService = require('./js/apiService');
var Signin = require('./signin');
var testComp = require('./body');

var Wrapper = React.createClass({
    getChildContext() {
        return {
            connector:apiService
        };
    },
    childContextTypes: {
        connector: React.PropTypes.object
    },

    render: function() {
        return (
    <div>
        <h1>Site banner</h1>
        
        <Signin/>
        <Router history={hashHistory}>
            <Route path="/" component={communityIssue}/>
            <Route path="edit" component={editCommunity}/>
            <Route path="test" component={testComp}/>
        </Router>
    </div>
        );
}
});

ReactDOM.render(<Wrapper/>,
    document.getElementById('theApp')
);