'use strict';
var React = require('react');

var Modal = require('react-bootstrap').Modal;

var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Column = require('react-bootstrap').Col;
var Checkbox = require('react-bootstrap').Checkbox;

var FormGroup = require('react-bootstrap').FormGroup;
var FormControl = require('react-bootstrap').FormControl;
var ControlLabel = require('react-bootstrap').ControlLabel;
var HelpBlock = require('react-bootstrap').HelpBlock;
var Button = require('react-bootstrap').Button;
var InputGroup = require('react-bootstrap').InputGroup;
var Tooltip = require('react-bootstrap').Tooltip;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Form = require('react-bootstrap').Form;
var Glyphicon = require('react-bootstrap').Glyphicon;
var Geosuggest = require('react-geosuggest').default;

var scriptLoader = require('react-async-script-loader');
var Avatar = require('../avatar/avatar');
var bizValidator = require('../../js/bizValidator');

require('./editUser.css');

var request = require('superagent');
var withsupererror = require('../../js/withsupererror');
var apiService = require('../../js/apiService');
var openChain = require('openchain');

var _ = require('lodash');

var Long = require('Long');
var RSVP = require('rsvp');


var GoogleAddress = scriptLoader.default(
    'https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyBG0SybP0EKWH3Jvwki7IR5AMyO_cUeeQc'
   )(React.createClass({
       getInitialState() { return {};},
       componentWillReceiveProps (nextProps) {


           if (nextProps.isScriptLoaded && !this.props.isScriptLoaded) { // load finished 
               if (nextProps.isScriptLoadSucceed) {
                   this.setState({ googleLoaded: true });
               }
               else {
                   Console.Error('Failed to log google');
               }
           }


       },

       componentDidMount () {

           if (this.props.isScriptLoaded && this.props.isScriptLoadSucceed) {
               this.setState({ googleLoaded: true });
           }
       },

       onChange(e) {
           if(this.props.onChange)
               this.props.onChange({value:e,validated:false})
       },
       onSuggestSelect(e) {
           if (this.props.onChange)
               this.props.onChange({ value: e.label, validated: true })
       },
       render: function() {
           return (
               this.state.googleLoaded?
               <Geosuggest
                   onChange={this.onChange}
                    onSuggestSelect={this.onSuggestSelect}
                   inputClassName="form-control"
                   style={{ suggestItem: { cursor: 'pointer' } }}
                   placeholder="Please start typing the address"
                   location={new google.maps.LatLng(53.558572, 9.9278215)}
                radius="20" />
            :<i className="fa fa-cog fa-spin"></i>
            );
}}));


module.exports = React.createClass({
    processProperties(user) {
        if (!user) {
            return { showModal: false,Errors : {} };
        }

        user.Errors = {};
        user.showModal = true;

        if (!user.name)
            user.name = '';
        if (!user.email)
            user.email = '';
        if (!user.handle)
            user.handle = '';
        if (!user.phone)
            user.phone = '';
        if (!user.address)
            user.address = '';

        this.isNewUser = user.handle ? false : true;

        if(this.validator)
            this.validator.reset();

        return user;
    },
    getInitialState() {
        return this.processProperties(this.props.user);
    },

    componentWillMount() {
        this.validator = new bizValidator(this, {
            name: { required: true, minimum: 10 },
            handle: { required: true, minimum: 5 },
            email: { required: true, regex: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ },
            address: {
                required: true, custom: function (v, c) {
                    if (!v.addressValidated) {
                        return {
                            ret: 'warning',
                            errorString: 'The address is not verified, use anyway'
                        };
                    }
                }
            }
        });
    },
    
    componentWillReceiveProps: function (nextProps) {
        this.setState(this.processProperties(nextProps.user));
    },

    OnNameChange(e) {
        if (this.state.saveProgress)
            return;
        this.setState({ name: e.target.value });
        this.validator.changed('name');
    },
    onBlurname() {
        if (this.state.saveProgress || !this.isNewUser
            ||  !this.state.name
            || (this.state.handle && this.state.handle.length > 0)
            || this.state.name.length == 0)
            return;

        this.setState({ handle: this.state.name.replace(/\W+/g, "_").substring(0, 15) });
        this.validator.changed('handle');
    },
    OnemailChange(e) {
        if (this.state.saveProgress)
            return;
        this.setState({ email: e.target.value });
        this.validator.changed('email');
    },
    OnhandleChange(e) {
        if (this.state.saveProgress || !this.isNewUser || e.target.value.length > 15)
            return;
        this.setState({ handle: e.target.value.replace(/\W+/g, "_") });
        this.validator.changed('handle');
    },
    OnphoneChange(e) {
        if (this.state.saveProgress)
            return;
        this.setState({ phone: e.target.value });
        this.validator.changed('phone');
    },
    OnaddressChange(e) {
        if (this.state.saveProgress )
            return;
        
        this.validator.addressValidated = e.validated;

        if (this.validator.showErrors)
            this.setState({ showUNvalidatedaddressCheckbox: !e.validated });

        this.setState({ address: e.value });
        this.validator.changed('address');
    },
    oUnvalidedUseChange(e, checked) {
        this.UseUnvalidatedAddress = e.target.checked;
    },
    onAvatarChange(e) {
        this.state.avatar = e;
    },

    cancel() {
        if (this.props.onCompleted)
            this.props.onCompleted(null);
    },
    done(e) {
        e.preventDefault();

        this.setState({ showUNvalidatedaddressCheckbox: !this.validator.addressValidated });

        if (!this.validator.isValid())
            return;

        var me = this;

        me.setState({ saveProgress: true });
        me.validator.ProcessingErrors = {};


        RSVP.hash({
            creds: apiService.getcredsAync(),
            apiClent: apiService.ensureAPIClient()
        })

        .then(function (results) {

            return RSVP.hash({
                info :results.apiClent.getDataRecord('/aka/' + me.state.handle + '/', 'info'),
                key: results.creds.hdPrivateKey,
                apiClent:results.apiClent
            });
        })
        
        .then(function (results) {

            var transaction = new openChain.TransactionBuilder(results.apiClent);
            transaction.key = results.key;

            return transaction.updateAccountRecord('/aka/' + me.state.handle + '/',
                apiService.getAssetName(), Long.fromString("0"))
                    
        })

        .then(function(transaction){
            return transaction.updateAccountRecord('/aka/' + me.state.handle + '/',
                apiService.getloginAssetName(), Long.fromString("0"))
        })

        .then(function(transaction){

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

            var toSend = {
                user: _.pick(me.state, ['handle', 'email', 'phone', 'name', 'address', 'avatar']),
                transaction: {
                    mutation: mutation.toHex(),
                    signatures: signatures
                }
            };
            toSend.user.communityHandle = apiService.getCommunityHandle();

            return new RSVP.Promise(function (resolve, reject) {
                request.post('/api/User')
                .set('Accept', 'application/json')
                .send(toSend)
                .end(function (err, res) {

                    if (err) {
                        reject(err);

                    } else {

                        if (me.props.onCompleted)
                            me.props.onCompleted(res.body);
                        resolve();
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


        
    },
    
    render() {
        const receiverTooltip = (
                    <Tooltip id="receiverTooltip">Please enter users's full name</Tooltip>
        );

        return (

        <div>
            <Modal bsSize="large"
                   show={this.state.showModal} onHide={this.cancel}>
                <Form horizontal onSubmit={this.done}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.isNewUser ? 'New User':'Updating ' + this.state.handle}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    
                       <Row>
                        <Column md={4}>
                            <div style={{ margin: '10px' }} className="text-center">
                                <Avatar Src={this.state.avatar} onChange={this.onAvatarChange}/>
                            </div>

                        </Column>
                        <Column md={8}>
                            <FormGroup controlId="name"
                                    validationState={this.validator.validate('name')}>
                                <InputGroup>
                                    <InputGroup.Addon>
                                        <OverlayTrigger placement="right" 
                                                          overlay={receiverTooltip}>
                                            <i className="fa fa-user"></i>
                                        </OverlayTrigger>
                                    </InputGroup.Addon>
                                    <FormControl type="text"
                                               value={this.state.name}
                                               placeholder="Enter full name"
                                               onBlur={this.onBlurname}
                                               onChange={this.OnNameChange} />
                                </InputGroup>
                                
                                <FormControl.Feedback />
                                <HelpBlock>{this.state.Errors.name}</HelpBlock>
                            </FormGroup>

                            <FormGroup controlId="handle" style={{maxWidth:'250px'}}
                                    validationState={this.validator.validate('handle')}>
                                <ControlLabel>Short handle for the user :</ControlLabel>
                                <InputGroup >
                                    <InputGroup.Addon>
                                        <OverlayTrigger placement="right" 
                                                          overlay={receiverTooltip}>
                                            <span>@</span>
                                        </OverlayTrigger>
                                    </InputGroup.Addon>
                                    <FormControl type="text"
                                               value={this.state.handle}
                                               placeholder="Enter user handle"
                                               onChange={this.OnhandleChange} />
                                </InputGroup>
                                
                                <FormControl.Feedback />
                                <HelpBlock>{this.state.Errors.handle}</HelpBlock>
                            </FormGroup>

                            <Row>
                                <Column sm={6}>
                            <FormGroup controlId="email"
                                    validationState={this.validator.validate('email')}>
                                <InputGroup>
                                    <InputGroup.Addon>
                                        <OverlayTrigger placement="right" 
                                                          overlay={receiverTooltip}>
                                            <Glyphicon glyph="envelope"/>
                                        </OverlayTrigger>
                                    </InputGroup.Addon>
                                    <FormControl type="email"
                                               value={this.state.email}
                                               placeholder="email address"
                                               onChange={this.OnemailChange} />
                                </InputGroup>
                                
                                <FormControl.Feedback />
                                <HelpBlock>{this.state.Errors.email}</HelpBlock>
                            </FormGroup>

                                </Column>
                                <Column sm={6}>
                            <FormGroup controlId="phone"
                                    validationState={this.validator.validate('phone')}>
                                <InputGroup>
                                    <InputGroup.Addon>
                                        <OverlayTrigger placement="right" 
                                                          overlay={receiverTooltip}>
                                            <Glyphicon glyph="phone-alt"/>
                                        </OverlayTrigger>
                                    </InputGroup.Addon>
                                    <FormControl type="text"
                                               value={this.state.phone}
                                               placeholder="phone number"
                                               onChange={this.OnphoneChange} />
                                </InputGroup>
                                
                                <FormControl.Feedback />
                                <HelpBlock>{this.state.Errors.phone}</HelpBlock>
                            </FormGroup>
                                </Column>
                            </Row>

                            <FormGroup controlId="address"
                               validationState={this.validator.validate('address')}>
                                <ControlLabel>Current address :</ControlLabel>
                                <HelpBlock>
                                {
                                this.state.showUNvalidatedaddressCheckbox ?
                                    <Checkbox onChange={this.oUnvalidedUseChange}>{this.state.Errors.address}</Checkbox> :
                                    <span>{this.state.Errors.address}</span>
                                }
                                </HelpBlock>
                                <GoogleAddress 
                                               value={this.state.address}
                                               onChange={this.OnaddressChange}
                                               />
                                
                                <FormControl.Feedback />
                                
                            </FormGroup>

                        </Column>
                       </Row>
                </Modal.Body>

                <Modal.Footer>
                    <div className="text-danger">{this.state.Errors.form}</div>
                    <Button type="submit" bsStyle="success" 
                                disabled={this.state.saveProgress}>
                    {
                        this.state.saveProgress ?
                                    <i className="fa fa-cog fa-spin" style={{marginRight:'5px'}}></i> : ''
                    }
                    {this.isNewUser ? 'Create user':'Update'}
                    </Button>
                    <Button onClick={this.cancel} bsStyle="warning">Cancel</Button>
                </Modal.Footer>
                
                </Form>
            </Modal>
         </div>
         );
    }
});