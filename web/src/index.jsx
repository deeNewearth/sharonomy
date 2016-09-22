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
var ChooseCommunity = require('./components/chooseCommunity');


var MainLayout = require('./layouts/main');


var Signin = require('./signin');
var testComp = require('./body');

var Wrapper = React.createClass({
    getInitialState() {
        return {};
    },

    onCommunitySelected(e) {
        this.setState({ communityHandle: e });
    },

    render: function() {
        return (
    <div>
        <Signin/>
        {this.state.communityHandle?
        <Router history={browserHistory} >
            <Route component={MainLayout}>
                <Route path="/" component={communityIssue}/>
                <Route path="edit" component={editCommunity}/>
                <Route path="test" component={testComp}/>
            </Route>
        </Router>

        : <ChooseCommunity onSelected={this.onCommunitySelected}/>
    
        }
    </div>
        );
}
});

ReactDOM.render(<Wrapper/>,
    document.getElementById('theApp')
);