'use strict';
var React = require('react');
var apiService = require('../js/apiService');
var Button = require('react-bootstrap').Button;
var PubSub = require('pubsub-js');

module.exports = React.createClass({
    getInitialState() {
        return {};
    },
    componentWillMount () {

        var me = this;
        this.pubSub_SIGNEDIN_token = PubSub.subscribe('SIGNEDIN', function (msg, data) {
            me.setState({ signedIn: true });
        });
        this.pubSub_SIGNEDOUT_token = PubSub.subscribe('SIGNEDOUT', function (msg, data) {
            me.setState({ signedIn: false });
        });
    },
    componentWillUnmount() {
        PubSub.unsubscribe(this.pubSub_SIGNEDIN_token);
        PubSub.unsubscribe(this.pubSub_SIGNEDOUT_token);
    },

    render() {
        return (
            <div>
                {
                    this.state.signedIn ?
                    <div>
                        I am in
                    </div>
                    :
                    <Button onClick={apiService.getcredsAync.bind(null, false)}
                                    bsStyle="link" >
                         Sign in       
                    </Button>
                }
            </div>
            );
    }
});