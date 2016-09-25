var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router').Router;
var Route = require('react-router').Route;
var browserHistory = require('react-router').browserHistory;


require('bootstrap/dist/css/bootstrap.css');
require('./assets/font-awesome-4.6.3/css/font-awesome.css');
require('./assets/customPositions.css');

var editCommunity = require('./components/editCommunity');
var ChooseCommunity = require('./components/chooseCommunity');

var MyBody = require('./body');

var Signin = require('./signin');
var MainLayout = require('./layouts/main');

var CommunityIssue = require('./components/issueHours/issueHours');
var ShowTransaction = require('./components/issueHours/showTransaction');



//var testComp = require('./components/recentIssues');

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
        {
            this.state.communityHandle?
            <Router history={browserHistory} >
                <Route component={MainLayout}>
                    <Route path="/" component={CommunityIssue}/>
                    <Route path="/issue" component={CommunityIssue}/>
                    <Route path="transaction/:mutationHash" component={ShowTransaction}/>
                </Route>
            </Router>
            :
            <ChooseCommunity onSelected={this.onCommunitySelected}/>
        }
    </div>
        );
}
});

ReactDOM.render(<Wrapper/>,
    document.getElementById('theApp')
);