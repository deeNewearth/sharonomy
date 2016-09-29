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
var withsupererror = require('./js/withsupererror');
var RSVP = require('RSVP');
var _ = require('lodash');
var openChain = require('openchain');
var Long = require('Long');
var jwtDecode = require('jwt-decode');

module.exports = React.createClass({
    handleToken (results) {
        var me = this;

        
        results.request.body.hdPrivateKey = results.privateKey;
        results.request.body.decoded = jwtDecode(results.request.body.token)
        me.pubKeyCallBack.success_callback(results.request.body);
                        
    },

    signinWithkey(community,hdPrivateKey) {
        var me = this;
        var pubKey = hdPrivateKey.privateKey.toAddress().toString();
        return RSVP.hash({
            myHandles :request
                        .get('/api/token/myHandles/' + community.handle + '/' + pubKey)
                        .set('Accept', 'application/json')
                        .use(withsupererror).end(),
            apiClient :apiService.ensureAPIClient()
        })

        .then(function (results) {
                        
            if (results.myHandles.error || !results.myHandles.body)
                throw results.error||'failed to get handles';


            var handles = results.myHandles.body;

            if (Object.keys(handles).length ==0) {
                throw 'no user found';
            }

            var retPromises = {};

            Object.keys(handles).map(function (key) {
                var transaction = new openChain.TransactionBuilder(results.apiClient);
                transaction.key = hdPrivateKey;
                            
                retPromises[key] = transaction.updateAccountRecord(handles[key],
                            apiService.getloginAssetName(), Long.fromString("0"));
            });

            return RSVP.hash(retPromises);
        })
                    
        .then(function (results) {
            var toSend = {};
            var privateKey = null;

            Object.keys(results).map(function (key) {
                var transaction = results[key];
                if (!privateKey)
                    privateKey = transaction.key;
                var signer = new openChain.MutationSigner(transaction.key);
                transaction.addSigningKey(signer);


                var mutation = transaction.build();
                var signatures = [];

                for (var i = 0; i < transaction.keys.length; i++) {
                    signatures.push({
                        signature: transaction.keys[i].sign(mutation).toHex(),
                        pub_key: transaction.keys[i].publicKey.toHex()
                    });
                }

                toSend[key + '_transaction'] = {
                    mutation: mutation.toHex(),
                    signatures: signatures
                };
            });

            toSend.PubKey = pubKey;

            return RSVP.hash({
                request: request
                    .post('/api/token/' + community.handle)
                    .send(toSend)
                    .set('Accept', 'application/json')
                    .use(withsupererror).end(),
                privateKey: privateKey
            });

        })

        .then(me.handleToken);
    },

    signinWithReset(communityHandle, hdPrivateKey) {
        var me = this;
        var pubKey = hdPrivateKey.privateKey.toAddress().toString();
        return RSVP.hash({
            request: request
                .post('/api/token/reset/' + communityHandle)
                .send({
                    email: me.state.email,
                    pin: me.state.pin,
                    PubKey: pubKey
                })
                .set('Accept', 'application/json')
                .use(withsupererror).end(),
            privateKey: hdPrivateKey
        })
        .then(me.handleToken);
    },

    componentWillMount() {
        var me = this;
        this.pubSub_LGIN_NEEDED_token = PubSub.subscribe('LOGIN NEEDED', function (msg, data) {
            me.pubKeyCallBack = data;

            new RSVP.Promise(function (resolve, reject) {
                var community = apiService.getCommunity();

                //if we have not chose community don't bother signing in with stored key
                if (typeof (localStorage) !== "undefined" && community) {
                    var stored = localStorage.getItem("myKey");
                    if (stored) {

                        me.setState({ signinProgress: true });
                        me.signinWithkey(community, new bitcore.HDPrivateKey(stored))
                        .then(function () {
                            resolve('signed in');
                        })
                        .catch(function (error) {
                            reject(error);
                        })
                        .finally(function () {
                            me.setState({ signinProgress: false });
                        });

                        //return needed or we will go to showModal
                        return;

                    }
                }

                reject('no stored key');
            })
            .catch(function (error) {

                if (me.pubKeyCallBack.savedKeyOnly) {
                    me.pubKeyCallBack.error_callback('no saved key');

                } else {
                    me.setState({ showModal: true });
                }

                
            });
            
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

        var community = apiService.getCommunity();
        var communityHandle = community ? community.handle : 'unknown_community';

        var me = this;
        if (this.state.register && !this.state.email) {
            this.setState({ signinProgress: true, error: null });


            request
            .get('/api/token/reset/' + communityHandle + '/' + this.state.emailEntry)
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

        var code = null;
        try {
            code = new Mnemonic(this.state.passPhrase);
        }
        catch (err) {
            me.setState({ error: 'invalid passphrase' });
        }

        if (!code)
            return;
        

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
        this.setState({ signinProgress: true, error: null });

        var Signin = this.state.register ?
            this.signinWithReset(communityHandle, hdPrivateKey) :
            this.signinWithkey(community, hdPrivateKey);

        
        Signin.then(function () {
                if (typeof (localStorage) !== "undefined") {
                    localStorage.setItem("myKey", derivedKey.xprivkey);
                }

                me.setState({
                    showModal :false,
                    passPhrase:'',
                    register:false,
                    pin:null
                });
            })
            .catch(function (error) {
                var err = 'Failed to sign in :';
                if(error && error.message) err +=error.message;
                else if(error) err +=error;
                me.setState({error: err });
            })
            .finally(function () {
                me.setState({signinProgress: false });
            });

    },

    OnNoResetCode() {
        this.setState({ email: null, pin:null });
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
            <div style={{ position: 'relative' }}>
            {
                ((!this.state.showModal && this.state.signinProgress)) ?
                    <h1 className="text-center text-muted"
                        style={{ position: 'absolute',zIndex: 10,width: '100%'}}
                        >
                        <i className="fa fa-cog fa-spin" style={{ marginRight: '5px' } }></i>Signing in...
                    </h1>: ''
                
            }
            <Modal show={this.state.showModal} onHide={this.cancel} 
                   backdrop='static' >
                <form onSubmit={this.OnSubmit }>
                <Modal.Header closeButton>
                    <Modal.Title>Sign in</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        this.state.register ?
                        <div>
                            {
                                this.state.email ?
                                <div>
                                    <div style={h4Style }>
                                        <span style={lockSTyle} className="glyphicon glyphicon-lock"></span>
                                        <FormGroup 
                                                   validationState={(this.state.pin && this.state.pin.length >= 5) ? 'success' : 'error'}
                                                   controlId="pin" style={{ display: 'inline-block' }
                                        }>
                                            <ControlLabel>
                                                    Reset code </ControlLabel>
                                            <FormControl type="text"
                                                         placeholder="Please check your email"
                                                         onChange={this.OnpinChange}
                                                           value={this.state.pin
                                            }
                                                           />
                                            <Button  onClick={this.OnNoResetCode}
                                                    style={{ marginTop: '10px' }}
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
                                                       value={this.state.passPhrase
                                        }
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
                                    <h4 style={h4Style }>
                                        <span style={lockSTyle} className="glyphicon glyphicon-lock"></span>
                                        Please enter your email address
                                    </h4>
                                    <FormGroup controlId="email"
                                           validationState={this.validateEmail()
                                    }>
                                        <FormControl type="email" autoFocus={true} 
                                                       value={this.state.emailEntry}
                                                        placeholder="Your email address"
                                                       onChange={this.OnemailChange
                                        } />
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
                            <h4 style={h4Style }>
                                <span style={lockSTyle} className="glyphicon glyphicon-lock"></span>
                                Please enter your passphrase to sign in
                            </h4>
                            <FormGroup controlId="passPhrase"
                                       validationState={this.state.register ? 'warning' : 'success'
                            }>
                                <ControlLabel>{this.state.register ?
                                        'Here\'s your new pass phrase' : 'Your pass phrase please'}</ControlLabel>
                                <FormControl type="text" autoFocus={true} 
                                               value={this.state.passPhrase}
                                               onChange={this.OnPassPhraseChange
                                } />
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
                            disabled={this.state.signinProgress || !this.isFormValid()
                    }>
                        {
                            this.state.signinProgress ?
                                <i className="fa fa-cog fa-spin" style={{ marginRight: '5px' } }></i> : ''

                        }

                        {
                        (this.state.register && !this.state.email) ? 'Send reset code' : 'Sign in'
}
                        
                    </Button>
                    <Button onClick={this.cancel} bsStyle="warning">Cancel</Button>
                </Modal.Footer>
                </form>
            </Modal>
            </div>

        );
    }
});