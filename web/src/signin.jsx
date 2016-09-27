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
var request = require('superagent');
var apiService = require('./js/apiService');


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
        this.setState({ passPhrase: '', register: false, signinProgress: false });
    },
    cancel() {
        this.setState({ showModal: false });
        this.clearState();
        
        if (this.pubKeyCallBack.error_callback)
            this.pubKeyCallBack.error_callback('User cancelled');

    },

    isFormValid() {

        if (this.state.register) {
            if (this.state.email) {
                return this.state.pin && this.state.pin.length >= 5 && this.state.passPhrase.length > 10;
            } else {
                return this.state.emailEntry && this.state.emailEntry.length > 0
                        && this.validateEmail() == 'success';
            }
        }

        return this.state.passPhrase.length > 10;
    },

    OnSubmit(e) {
        e.preventDefault();
        if (!this.isFormValid())
            return;

        var me = this;
        if (this.state.register && !this.state.email) {
            this.setState({ signinProgress: true,error:null });
            request
            .get('/api/token/reset/' + apiService.getCommunityHandle() + '/' + this.state.emailEntry)
            .set('Accept', 'application/json')
            .end(function (err, res) {

                var retState = { signinProgress: false };

                if (!err) {
                    retState.email = me.state.emailEntry;
                } else {
                    retState.error = 'Failed to send code';
                    if (err.response && err.response.body) {
                        retState.error += (' : ' + err.response.body.message);
                    }
                }

                me.setState(retState);
            });


            return;
        }

        if (this.state.register) {
            var code = new Mnemonic(this.state.passPhrase);

            /*if this fails make sure in file 
            C:\codework\sharonomy\web\node_modules\node-libs-browser\package.json
            crypto browsify is updated. it fails cause webpack install old crypto-browserify
            "crypto-browserify": "~3.11.0",
            and run npm install
            */
            var derivedKey = code.toHDPrivateKey(null, "livenet");
            
            var hdPrivateKey = new bitcore.HDPrivateKey(derivedKey.xprivkey);

            //I don't think we need that any more
            //hdPrivateKey.network = bitcore.Networks.get("openchain");

            var pubKey= hdPrivateKey.privateKey.toAddress().toString();
            
            this.setState({ signinProgress: true, error: null });
            request
            .post('/api/token/reset/' + apiService.getCommunityHandle())
            .send({
                email: this.state.email,
                pin: this.state.pin,
                PubKey: pubKey
            })
            .set('Accept', 'application/json')
            .end(function (err, res) {

                var retState = { signinProgress: false };

                if (!err) {
                    retState.showModal = false;
                    retState.passPhrase = '';
                    retState.register = false;
                    res.body.hdPrivateKey = hdPrivateKey;
                    if (typeof (localStorage) !== "undefined") {
                        localStorage.setItem("myKey", derivedKey.xprivkey);
                    }
                    me.pubKeyCallBack.success_callback(res.body);
                } else {
                    retState.error = 'Failed to sign in';
                    if (err.response && err.response.body) {
                        retState.error += (' : ' + err.response.body.message);
                    }
                }

                me.setState(retState);
            });

        }

    },

    OnNoResetCode() {
        this.setState({ email: null });
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

    validateEmail() {
        var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(this.state.emailEntry) ? 'success' : 'error';
    },

    OnemailChange(e) {
        this.setState({ emailEntry: e.target.value });
    },

    OnpinChange(e) {
        this.setState({ pin: e.target.value });
    },


    render: function () {

        var lockSTyle = {
            margin: '0px 10px',
            padding: '20px',
            fontSize: '25px',
            border: '#ddd solid 4px',
            verticalAlign: 'top'
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
                    {
                        this.state.register?
                        <div>
                            {
                                this.state.email?
                                <div>
                                    <div style={h4Style}>
                                        <span style={lockSTyle} className="glyphicon glyphicon-lock"></span>
                                        <FormGroup 
                                                   validationState={(this.state.pin && this.state.pin.length>=5)?'success':'error'}
                                                   controlId="pin" style={{display: 'inline-block'}}>
                                            <ControlLabel>
                                                    Reset code </ControlLabel>
                                            <FormControl type="text"
                                                         placeholder="Please check your email"
                                                         onChange={this.OnpinChange}
                                                           value={this.state.pin}
                                                           />
                                            <Button  onClick={this.OnNoResetCode}
                                                    style={{marginTop: '10px'}}
                                                bsStyle="danger" bsSize="xsmall" 
                                            >
                                            Reset code did not arrive
                                            </Button>
                                        </FormGroup>
                                    </div>
                                    <FormGroup controlId="passPhrase">
                                        <ControlLabel>
                                                Here's your new pass phrase </ControlLabel>
                                        <FormControl type="text"
                                                       value={this.state.passPhrase}
                                                       />
                                    </FormGroup>
                                    <div>
                                        <strong className="text-primary">
                                            This pass phrase can be used to signin next time
                                        </strong>
                                    </div>
                                </div>
                                :
                                <div>
                                    <h4 style={h4Style}>
                                        <span style={lockSTyle} className="glyphicon glyphicon-lock"></span>
                                        Please enter your email address
                                    </h4>
                                    <FormGroup controlId="email"
                                           validationState={this.validateEmail()}>
                                        <FormControl type="email" autoFocus={true} 
                                                       value={this.state.emailEntry}
                                                        placeholder="Your email address"
                                                       onChange={this.OnemailChange} />
                                    </FormGroup>
                                    <div>
                                        <strong className="text-primary">
                                            We will send you a reset code at this email address
                                        </strong>
                                    </div>
                                </div>
                            }
                            
                        </div>
                        :
                        <div>
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

                            <Button  onClick={this.OnNoPasspharse}
                                bsStyle="danger" bsSize="xsmall" 
                            >
                            I don't have one or forgot my passphrase
                            </Button>

                        </div>
                    }
                    

                   
                    
                    
                </Modal.Body>
                <Modal.Footer>
                    <span className="text-danger">{this.state.error}</span>
                    <Button type="submit" bsStyle="success" 
                            disabled={this.state.signinProgress || !this.isFormValid()}>
                        {
                            this.state.signinProgress ?
                                <i className="fa fa-cog fa-spin" style={{marginRight:'5px'}}></i> : ''
                            
                        }

                        {
                        (this.state.register && !this.state.email) ? 'Send reset code' : 'Sign in'
                        }
                        
                    </Button>
                    <Button onClick={this.cancel} bsStyle="warning">Cancel</Button>
                </Modal.Footer>
                </form>
            </Modal>
        );
    }
});