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
require('superagent-auth-bearer')(request);

var bizValidator = require('../js/bizValidator');
var apiService = require('../js/apiService');
var Avatar = require('./avatar/avatar');
var withsupererror = require('../js/withsupererror');
var _ = require('lodash');


module.exports = React.createClass({
    mixins: [LoggerMixin],
    
    getInitialState() {
        return {
            full_name:'',handle:'',description:'',
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

    componentDidMount() {
        if (this.props.params && this.props.params.handle) {
            this.UpdatingExisting = true;
            this.setState({ handle: this.props.params.handle, saveProgress: true });

            var me = this;
            request
                .get('/api/Community/handle/' + this.props.params.handle)
                .set('Accept', 'application/json')
                .use(withsupererror).end()

            .then(function (results) {
                
                var newstate = _.assign(me.state, results.body);
                newstate.saveProgress = false;
                me.setState(newstate);
            })

            .catch(function (err) {
                me.setState({ Errors: { form: 'Failed to load details :' + err.message } });
            });
        }
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
        if (this.UpdatingExisting || this.state.saveProgress || e.target.value.length > 25)
           return;
       this.setState({ handle: e.target.value.replace(/\W+/g, "_") });
    },
    OnDescriptionChange(e) {
        if (this.state.saveProgress)
            return;
        this.setState({ description: e.target.value });
    },
    onAvatarChange(e) {
        if (this.state.saveProgress)
            return;
        this.state.avatar = e;
    },


    OnSubmit(e) {
        e.preventDefault();

        if (!this.validator.isValid())
            return;

        var me = this;

        me.setState({ saveProgress: true });
        me.validator.ProcessingErrors = {};


        apiService.getcredsAync()

        .then(function (creds) {
            var key = creds.hdPrivateKey;

            var fields = _.pick(me.state, ['full_name', 'description', 'avatar']);
            if (!me.UpdatingExisting)
                fields.adminPubKey = key.privateKey.toAddress().toString()
            else
                fields.handle = me.state.handle;

            var r = me.UpdatingExisting?
                request.post('/api/Community'):request.put('/api/Community/' + me.state.handle);

            return r.send(fields)
                    .authBearer(creds.token)
                    .set('Accept', 'application/json')
                    .use(withsupererror).end()
        })

        .then(function(results){
            if (me.props.onDone) {
                me.props.onDone(results.body);
            }
            me.setState(_.assign(me.state, results.body));
        })

        .catch(function (err) {
            me.validator.HandleProcessingError(err, 'failed to save');
        })

        .finally(function () {
            me.setState({ saveProgress: false });
        })
        ;

    },

    render: function() {
        return (
    <form onSubmit={this.OnSubmit}>
        <Avatar width={700} height={300} PickMessage={'Click to pick your community banner'}
                Src={this.state.avatar}
                onChange={this.onAvatarChange}
                />
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

        {
        this.UpdatingExisting?'':
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
        }
        

        <FormGroup controlId="descriptionText"
                   validationState={this.validator.validate('description')}>
          <FormControl componentClass="textarea"
                       value={this.state.description}
                       placeholder="Description of your community"
                       onChange={this.OnDescriptionChange} />
          <FormControl.Feedback />
          <HelpBlock>{this.state.Errors.description}</HelpBlock>
        </FormGroup>

        <div  className="text-center">
            <div className="text-danger">{this.state.Errors.form}</div>
            <Button type="submit" bsStyle="success" 
                        disabled={this.state.saveProgress}>
                {this.UpdatingExisting?'Update':'Create'} timebank 
                {
                this.state.saveProgress ?
                                    <i className="fa fa-cog fa-spin" style={{marginRight:'5px'}}></i> : ''
                }
            </Button>

            <Button  bsStyle="warning" style={{marginLeft:'10px'}}
                        onClick={this.props.onCancel}
                        disabled={this.state.saveProgress}>
                Cancel
            </Button>
        </div>

     </form>
        );
    }
});