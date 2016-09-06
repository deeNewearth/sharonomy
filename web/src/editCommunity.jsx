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

module.exports = React.createClass({
    displayName: 'editCommunity',
    mixins: [LoggerMixin],
    minimums : {
        full_name: 10,
        handle: 8,
        description:20
    },

    contextTypes: {
        color: React.PropTypes.string,
        connector: React.PropTypes.object
    },

    getInitialState() {
        return {
            handle: 'czczczzxczxcxzczx',

            full_name: 'San marcos lake atitlan bal dasd sadasdasdasdsa',
            description: 'asdasdasdasdas\ndasdasdasdasdasd\nasdsadsadasdasdsadasdasdsad',

            error_text: '',
            HandleError: '',
            fieldWarnings:{},
            savingData :false
        };
    },

    validateLength(field) {
       // else if (length > 5) return 'warning';
        const length = this.state[field].length;
        if (0 == length)
            return;
        else if (length >= this.minimums[field])
            return 'success';
        else {
            return 'warning';
        }
       // this.setState({ fieldWarnings: warnArray });

        

    },
    getHandleValidationState() {
        
        if (this.state.HandleError)
            return 'error';

        return this.validateLength('handle');
    },
    OnFullNameChange(e) {
        if (this.state.savingData)
            return;
        this.setState({ full_name: e.target.value });

    },
    onBlurfullName() {
        if (this.state.handle.length == 0 && this.state.full_name.length>0)
            this.setState({ handle: this.state.full_name.replace(/\W+/g, "_").substring(0,20) });
        
    },
    OnHandleChange(e) {
       if (this.state.savingData || e.target.value.length>25)
           return;
       this.setState({ handle: e.target.value.replace(/\W+/g, "_") });
    },
    OnDescriptionChange(e) {
        if (this.state.savingData)
            return;
        this.setState({ description: e.target.value });
    },

    isFormValid() {
        
        for (var field in this.minimums) {
            if (this.validateLength(field) !== 'success')
                return false;
        }

        if (!this.state.handle.match(/^([0-9]|[a-z]|_)+([0-9a-z_]+)$/i)) {
            this.error('invalid charaters in handle');
            return false;
        }
        return true;
    },

    OnSubmit(e) {
        e.preventDefault();

        if (!this.isFormValid()) {
            this.error('form is not valid');
            return;
        }

        var me = this;
        me.setState({ error_text: '' });
        me.setState({ HandleError: '' });
        me.setState({ savingData: true });

        me.context.connector.getKeyAync()
        .then(function (key) {
            var apiClent = me.context.connector.ensureAPIClient();

            apiClent.getDataRecord('/community/' + me.state.handle + '/', 'info')
            .then(function (info) {
                if (info.data) {
                    //the handle exists
                    //we are changing some information
                    me.setState({ HandleError: 'This handle is already taken. Please choose another' });
                    me.setState({ savingData: false });
                    return;

                    var transaction = new openChain.TransactionBuilder(apiClent);
                    transaction.addRecord(info.key,
                        openChain.encoding.encodeString('test data'), info.version);
                    transaction.key = key;

                    var signer = new openChain.MutationSigner(transaction.key);

                    transaction.addSigningKey(signer).submit()
                    .then(function (response) {
                        me.setState({ savingData: false });
                        $scope.transactionHash = response["transaction_hash"];
                        $scope.mutationHash = response["mutation_hash"];
                    }, function (response) {
                        var error = "failed to save : ";

                        if (response.statusCode == 400) {
                            error += response.data["error_code"];
                        }

                        me.setState({ error_text: error });
                        me.setState({ savingData: false });
                    });

                } else {
                    request
                    //.post('/api/Community/' + me.state.handle)
                    .put('/api/Community/' + me.state.handle)
                    .send({
                        full_name: me.state.full_name,
                        description: me.state.description,
                        admin_addresses: [key.privateKey.toAddress().toString()]
                    })
                    //.set('X-API-Key', 'foobar')
                    .set('Accept', 'application/json')
                    .end(function (err, res) {
                        if (err) {
                            me.setState({ error_text: 'failed to save :' + err.message });
                        }
                        me.setState({ savingData: false });
                    });

                }
            }, function (err) {
                //openchain error handling sucks it never makes it here
                me.setState({ error_text: 'failed to save.  existance check failed : ' + err.message });
                me.setState({ savingData: false });
            });


        });



    },

    render: function() {
        return (
    <form onSubmit={this.OnSubmit}>
        <FormGroup controlId="fullNameText"
                   validationState={this.validateLength('full_name')}>
          
          <FormControl type="text"
                       value={this.state.full_name}
                       placeholder="Name of your community"
                       onBlur={this.onBlurfullName}
                       onChange={this.OnFullNameChange} />
          <FormControl.Feedback />
          <HelpBlock>{this.state.fieldWarnings['full_name']}</HelpBlock>
        </FormGroup>

        <FormGroup controlId="HandleText"
                   validationState={this.getHandleValidationState()}>
          <ControlLabel>Your communitie's handle</ControlLabel>
          <FormControl type="text"
                       value={this.state.handle}
                       placeholder="Community short name"
                       onChange={this.OnHandleChange} />
          <FormControl.Feedback />
          <HelpBlock>{this.state.HandleError}</HelpBlock>
        </FormGroup>

        <FormGroup controlId="descriptionText"
                   validationState={this.validateLength('description')}>
          <FormControl componentClass="textarea"
                       value={this.state.description}
                       placeholder="Description of your community"
                       onChange={this.OnDescriptionChange} />
          <FormControl.Feedback />
          
        </FormGroup>

        <div className="text-danger">{this.state.error_text}</div>
        <Button type="submit" bsStyle="success" 
                    disabled={this.state.savingData || !this.isFormValid()}>
            Create timebank 
            {
            this.state.savingData ?
                                <i className="fa fa-cog fa-spin" style={{marginRight:'5px'}}></i> : ''
            }
        </Button>

     </form>
        );
    }
});