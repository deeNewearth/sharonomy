'use strict';

var React = require('react');
var LoggerMixin = require('react-logger');
var form = require('react-bootstrap').form;
var FormGroup = require('react-bootstrap').FormGroup;
var ControlLabel = require('react-bootstrap').ControlLabel;
var FormControl = require('react-bootstrap').FormControl;
var HelpBlock = require('react-bootstrap').HelpBlock;
var Button = require('react-bootstrap').Button;
var openChain = require('openchain');
var request = require('superagent');
var RSVP = require('rsvp');

var bizValidator = require('../js/bizValidator');
var apiService = require('../js/apiService');
var browserHistory = require('react-router').browserHistory;

module.exports = React.createClass({
    mixins: [LoggerMixin],
    
    getInitialState() {
        return {
            Errors: {}
        };
    },

    componentWillMount() {
        this.validator = new bizValidator(this, {
            full_name: { required: true, minimum: 10 },
            handle: { required: true, minimum: 8 },
            description: { required: true, minimum: 20 }
        });
    },

    OnFullNameChange(e) {
        if (this.state.saveProgress)
            return;
        this.setState({ full_name: e.target.value });

    },
    onBlurfullName() {

        if (this.state.saveProgress 
            || !this.state.full_name
            || (this.state.handle && this.state.handle.length > 0)
            || this.state.full_name.length == 0)
            return;
       

        this.setState({ handle: this.state.full_name.replace(/\W+/g, "_").substring(0,20) });
        
    },
    OnHandleChange(e) {
        if (this.state.saveProgress || e.target.value.length > 25)
           return;
       this.setState({ handle: e.target.value.replace(/\W+/g, "_") });
    },
    OnDescriptionChange(e) {
        if (this.state.saveProgress)
            return;
        this.setState({ description: e.target.value });
    },

    OnSubmit(e) {
        e.preventDefault();

        if (!this.validator.isValid())
            return;

        var me = this;

        me.setState({ saveProgress: true });
        me.validator.ProcessingErrors = {};

        apiService.getKeyAync()
        .then(function (key) {

            return new RSVP.Promise(function (resolve, reject) {
                request
                .put('/api/Community/' + me.state.handle)
                .send({
                    full_name: me.state.full_name,
                    description: me.state.description,
                    adminPubKey: key.privateKey.toAddress().toString()
                })
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                        browserHistory.push('/');
                    }
                });

            });

        })

        .catch(function (err) {
            me.validator.HandleProcessingError(err, 'failed to save');
        })

        .finally(function () {
            me.setState({ saveProgress: false });
        })
        ;

        /*

        apiService.getKeyAync()
        .then(function (key) {
            apiService.ensureAPIClient()
            .then(function (apiClent) {

                apiClent.getDataRecord('/community/' + me.state.handle + '/', 'info')
                .then(function (info) {
                    if (info.data) {

                        //the handle exists

                        

                        var transaction = new openChain.TransactionBuilder(apiClent);
                        transaction.addRecord(info.key,
                            openChain.encoding.encodeString(JSON.stringify({
                                full_name: me.state.full_name,
                                description: me.state.description,
                                admin_addresses: [key.privateKey.toAddress().toString()]

                            })), info.version);
                        transaction.key = key;

                        var signer = new openChain.MutationSigner(transaction.key);

                        transaction.addSigningKey(signer).submit()
                        .then(function (response) {
                            me.setState({ saveProgress: false });
                            $scope.transactionHash = response["transaction_hash"];
                            $scope.mutationHash = response["mutation_hash"];
                        }, function (response) {
                            var error = "failed to save : ";

                            if (response.statusCode == 400) {
                                error += response.data["error_code"];
                            }

                            me.setState({ error_text: error });
                            me.setState({ saveProgress: false });
                        });

                    } else {
                        

                    }
                });

            });
        });
        */


    },

    render: function() {
        return (
    <form onSubmit={this.OnSubmit}>
        <FormGroup controlId="fullNameText"
                   validationState={this.validator.validate('full_name')}>
          
          <FormControl type="text"
                       value={this.state.full_name}
                       placeholder="Name of your community"
                       onBlur={this.onBlurfullName}
                       onChange={this.OnFullNameChange} />
          <FormControl.Feedback />
          <HelpBlock>{this.state.Errors.full_name}</HelpBlock>
        </FormGroup>

        <FormGroup controlId="HandleText"
                   validationState={this.validator.validate('handle')}>
          <ControlLabel>Your communitie's handle</ControlLabel>
          <FormControl type="text"
                       value={this.state.handle}
                       placeholder="Community short name"
                       onChange={this.OnHandleChange} />
          <FormControl.Feedback />
          <HelpBlock>{this.state.Errors.handle}</HelpBlock>
        </FormGroup>

        <FormGroup controlId="descriptionText"
                   validationState={this.validator.validate('description')}>
          <FormControl componentClass="textarea"
                       value={this.state.description}
                       placeholder="Description of your community"
                       onChange={this.OnDescriptionChange} />
          <FormControl.Feedback />
          <HelpBlock>{this.state.Errors.description}</HelpBlock>
        </FormGroup>

        <div className="text-danger">{this.state.Errors.form}</div>
        <Button type="submit" bsStyle="success" 
                    disabled={this.state.saveProgress}>
            Create timebank 
            {
            this.state.saveProgress ?
                                <i className="fa fa-cog fa-spin" style={{marginRight:'5px'}}></i> : ''
            }
        </Button>

     </form>
        );
    }
});