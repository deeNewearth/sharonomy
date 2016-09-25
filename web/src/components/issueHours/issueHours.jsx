'use strict';

var React = require('react');
var IssueForm = require('./issueForm');
var ShowTransaction = require('./showTransaction');
var Button = require('react-bootstrap').Button;

module.exports = React.createClass({
    getInitialState() {
        return {};
    },
    onIssue(e){
        this.setState(e);
    },
    onIssueagain(e){
        this.setState({ receivers :null});
    },
    
    render: function() {
        return (
            <div>
            {
                this.state.receivers ?
                <div className="text-center">
                    <h3>Sucessfully issued hours</h3>
                    <ShowTransaction mutation={this.state}/>
                    <Button onClick={this.onIssueagain}
                           bsStyle="info" bsSize="xsmall" >
                                Issue more hours
                    </Button>
                </div>
                
                : <IssueForm onIssue={this.onIssue}/>
            }
            </div>
        );
    }
});