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
        this.setState({ mutation: e });
    },
    onIssueagain(e){
        this.setState({ mutation: null });
    },
    
    render: function() {
        return (
            <div>
            {
                this.state.mutation ?
                <div className="text-center">
                    <h3>Sucessfully {this.props.useTreasury?'issued':'exchanged'} hours</h3>
                    <ShowTransaction mutation={this.state.mutation}/>
                    <Button onClick={this.onIssueagain}
                           bsStyle="info" bsSize="xsmall" >
                                {this.props.useTreasury?'Issue':'exchange'} more hours
                    </Button>
                </div>
                
                : <IssueForm onIssue={this.onIssue} useTreasury={this.props.useTreasury}/>
            }
            </div>
        );
    }
});