'use strict';
var React = require('react');
var apiService = require('../js/apiService');
var Button = require('react-bootstrap').Button;
var PubSub = require('pubsub-js');

module.exports = React.createClass({
    getInitialState() {
        return { signedIn: false };
    },
    onSignedin(creds) {
        var signedin = false;

        if (this.props.admin) {
            if (creds.decoded.admin)
                signedin = true;
        }else if (this.props.ACC) {
            if (creds.decoded.ACC)
                signedin = true;
        } else {
            signedin = true;
        }

        if(signedin != this.state.signedin)
            this.setState({ signedIn: signedin });
    },
    onSignedOut() {
        this.setState({ signedIn: false });
    },
    componentWillMount () {

        var me = this;
        this.pubSub_SIGNEDIN_token = PubSub.subscribe('SIGNEDIN', function (msg, data) {
            me.onSignedin(data);
        });
        this.pubSub_SIGNEDOUT_token = PubSub.subscribe('SIGNEDOUT', this.onSignedOut);

        apiService.getcredsAync(true).then(this.onSignedin);


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
                        {this.props.children}
                    </div>
                    :
                    ''
                }
            </div>
            );
}
});