'use strict';

var React = require('react');
var Modal = require('react-bootstrap').Modal;
var PubSub = require('pubsub-js');
var Button = require('react-bootstrap').Button;
var form = require('react-bootstrap').form;
var FormGroup = require('react-bootstrap').FormGroup;
var ControlLabel = require('react-bootstrap').ControlLabel;
var FormControl = require('react-bootstrap').FormControl;
var Mnemonic = require("bitcore-mnemonic");
var bitcore = require("bitcore-lib");


module.exports = React.createClass({
    componentWillMount() {
        var me = this;
        this.pubSub_LGIN_NEEDED_token = PubSub.subscribe('LOGIN NEEDED', function (msg, data) {
            me.pubKeyCallBack = data;

            if (typeof (localStorage) !== "undefined") {
                var stored = localStorage.getItem("myKey");
                if (stored) {
                    me.pubKeyCallBack.success_callback(new bitcore.HDPrivateKey(stored));
                    return;
                }
            } 

            me.setState({ showModal: true });
        });

        
    },
    componentWillUnmount() {
        PubSub.unsubscribe(this.pubSub_LGIN_NEEDED_token);
    },

    getInitialState() {
        return {
            showModal: false,
            passPhrase: '',
            register: false,
            signinProgress:false
        };
    },
    clearState() {
        //clear out state
        this.setState({ passPhrase: '' });
        this.setState({ register: false });
        this.setState({ signinProgress: false });
    },
    cancel() {
        this.setState({ showModal: false });
        this.clearState();
        
        if (this.pubKeyCallBack.error_callback)
            this.pubKeyCallBack.error_callback('User cancelled');

    },

    OnSubmit(e) {
        e.preventDefault();
        if (!this.isFormValid())
            return;

        //this.setState({ signinProgress: true });

        var code = new Mnemonic(this.state.passPhrase);

        /*if this fails make sure in file 
        C:\codework\sharonomy\web\node_modules\node-libs-browser\package.json
        crypto browsify is updated. it fails cause webpack install old crypto-browserify
        "crypto-browserify": "~3.11.0",
        and run npm install
        */
        var derivedKey = code.toHDPrivateKey(null, "livenet");
        if (typeof (localStorage) !== "undefined") {
            localStorage.setItem("myKey", derivedKey.xprivkey);
        }
        var hdPrivateKey = new bitcore.HDPrivateKey(derivedKey.xprivkey);

        //I don't think we need that any more
        //hdPrivateKey.network = bitcore.Networks.get("openchain");

        var pubKeyfortest = hdPrivateKey.privateKey.toAddress().toString();


        this.setState({ showModal: false });
        this.clearState();
        this.pubKeyCallBack.success_callback(hdPrivateKey);

        

    },

    OnPassPhraseChange(e) {
        if (this.state.register)
            return;
        this.setState({ passPhrase: e.target.value });
    },

    OnNoPasspharse() {
        this.setState({ register: true });
        var generatedMnemonic = new Mnemonic();
        var newpassphrase = generatedMnemonic.toString();
        this.setState({ passPhrase: newpassphrase });
    },

    isFormValid() {
        return this.state.passPhrase.length > 10;
    },

    render: function () {

        var lockSTyle = {
            margin: '0px 10px',
            padding: '20px',
            fontSize: '25px',
            border: '#ddd solid 4px'
        };

        var h4Style = { marginTop: '0px' };

        return (
            <Modal show={this.state.showModal} onHide={this.cancel} 
                   backdrop='static' >
                <form onSubmit={this.OnSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Sign in</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4 style={h4Style}>
                        <span style={lockSTyle} className="glyphicon glyphicon-lock"></span>
                        Please enter your passphrase to sign in
                    </h4>
                    <FormGroup controlId="passPhrase"
                               validationState={this.state.register?'warning':'success'}>
                        <ControlLabel>{this.state.register ? 
                                'Here\'s your new pass phrase' : 'Your pass phrase please'}</ControlLabel>
                        <FormControl type="text" autoFocus={true} 
                                       value={this.state.passPhrase}
                                       onChange={this.OnPassPhraseChange} />
                    </FormGroup>

                    

                    {
                    this.state.register?
                        <div>
                            <strong className="text-primary">
                                Please write down your new pass pharse. 
                                You will need it sign in next time
                            </strong>
                        </div>
                    :
                        <div>
                            <Button  onClick={this.OnNoPasspharse}
                                bsStyle="danger" bsSize="xsmall" 
                            >
                            I don't have one or forgot my passphrase
                            </Button>
                        </div>

                    }
                    
                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" bsStyle="success" 
                            disabled={this.state.signinProgress || !this.isFormValid()}>
                        {
                            this.state.signinProgress ?
                                <i className="fa fa-cog fa-spin" style={{marginRight:'5px'}}></i> : ''
                        }
                        Sign in
                    </Button>
                    <Button onClick={this.cancel} bsStyle="warning">Cancel</Button>
                </Modal.Footer>
                </form>
            </Modal>
        );
    }
});