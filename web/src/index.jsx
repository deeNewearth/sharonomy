var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router').Router;
var Route = require('react-router').Route;
var browserHistory = require('react-router').browserHistory;


require('bootstrap/dist/css/bootstrap.css');
require('./assets/font-awesome-4.6.3/css/font-awesome.css');
require('./assets/customPositions.css');

var editCommunity = require('./components/editCommunity');
var communityIssue = require('./components/issueHours/issueHours');


var Signin = require('./signin');
var testComp = require('./body');

var Wrapper = React.createClass({
    render: function() {
        return (
    <div>
        <h1>Site banner</h1>
        
        <Signin/>
        <Router history={browserHistory}>
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