'use strict';
var React = require('react');


var FormGroup = require('react-bootstrap').FormGroup;
var FormControl = require('react-bootstrap').FormControl;
var HelpBlock = require('react-bootstrap').HelpBlock;
var Button = require('react-bootstrap').Button;
var InputGroup = require('react-bootstrap').InputGroup;
var Tooltip = require('react-bootstrap').Tooltip;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Form = require('react-bootstrap').Form;

var DropdownInput = require('../inputDropDown');
var request = require('superagent');

var RSVP = require('rsvp');
var apiService = require('../../js/apiService');

var EditUser = require('../editUser/editUser');

var UserSearchTemplate = React.createClass({
    render() {
        return (<div>i ama user</div>);
    }
});

module.exports = React.createClass({
    processProperties(props) {
        var rec = props;
        rec.Errors = {};
        if (rec.handle)
            this.isUpdating = true;
        else
            rec.handle = '';

        if (!rec.hours)
            rec.hours = '';

        this.isUpdating = false;
        this.ErrorList= {};
        this.showHelpErrors = false;

        return rec;
    },
    getInitialState() {
        return this.processProperties(this.props.recepient);
    },
    componentWillReceiveProps: function (nextProps) {
        this.setState(this.processProperties(nextProps.recepient));
    },
    

    OnhandleChange(e) {
        if (this.state.savingData || this.isUpdating)
            return;
        this.setState({ 'handle': e.target.value });
    },

    ishandleValid() {

        if (this.state.handle.length > 5) {
            if (this.ErrorList.handle)
                delete this.ErrorList.handle;
            return 'success';
        }

        this.ErrorList.handle = 'Handle must be at least 5 characters';

        if (!this.showHelpErrors)
            return;

        return 'error';

    },

    OnhoursChange(e) {
        if (this.state.savingData)
            return;
        this.setState({ hours: e.target.value });
    },

    ishoursValid() {

        if (this.state.hours && this.state.hours < 10) {
            if (this.ErrorList.hours)
                delete this.ErrorList.hoursHandle;
            return 'success';
        }

        this.ErrorList.hours = 'Hours must be between 1 and 10';

        if (!this.showHelpErrors)
            return;

        return 'error';

    },

    onAddUser(e) {
        e.preventDefault();

        this.ErrorList = {};
        this.showHelpErrors = true;
        this.ishandleValid();
        this.ishoursValid();


        if (Object.keys(this.ErrorList).length > 0) {
            this.setState({ Errors: this.ErrorList });
            return;
        }

        this.state.Errors = {};

        if (this.props.addNewRecepient)
            this.props.addNewRecepient(this.state);
        
        this.showHelpErrors = false;
    },

    fetchUsers(pattern) {
        return new RSVP.Promise(function (resolve, reject) {
            request
            .get('/api/User/' + apiService.getCommunityHandle() + '/' + pattern)
            .set('Accept', 'application/json')
            .end(function (err, res) {
                var g = 9;
            });

        });
    },
    showUserDlg() { this.setState({ NewUser: {}})},

    render: function () {
        const receiverTooltip = (
            <Tooltip id="receiverTooltip">Please enter receiver's handle</Tooltip>
        );
        const useraddTooltip = (
            <Tooltip id="useraddTooltip">Add new user</Tooltip>
        );

        return (

            <Form inline onSubmit={this.onAddUser} 
                  className="forminLinewithHelpBlock text-center">
                <EditUser user={this.state.NewUser}/>
                <FormGroup validationState={this.ishandleValid() }>
                    <InputGroup>
                        <InputGroup.Addon><OverlayTrigger placement="right" 
                                                          overlay={receiverTooltip}>
                            <i className="fa fa-user"></i>
                            </OverlayTrigger>
                        </InputGroup.Addon>
                        
                        <DropdownInput placeholder="Search for user"
                                       SearchQuery={this.fetchUsers}>
                            <UserSearchTemplate/>
                        </DropdownInput>
                        
                        <InputGroup.Button>
                            <Button onClick={this.showUserDlg}
                                    ><OverlayTrigger placement="left" 
                                                      overlay={useraddTooltip}>
                                        <i className="fa fa-user-plus text-warning"></i>
                            </OverlayTrigger></Button>
                        </InputGroup.Button>
                        
                    </InputGroup>
                    <HelpBlock>{this.state.Errors.handle}</HelpBlock>
                </FormGroup>

                <FormGroup  validationState={this.ishoursValid() }>
                    <InputGroup style={{ maxWidth: '190px' } }>
                        <InputGroup.Addon><i className="fa fa-clock-o"></i></InputGroup.Addon>
                        <FormControl type="number" 
                                value={this.state.hours} onChange={this.OnhoursChange}         
                                placeholder="hours" />
                        <InputGroup.Addon>hours</InputGroup.Addon>
                    </InputGroup>
                    <HelpBlock>{this.state.Errors.hours}</HelpBlock>
                </FormGroup>

                <FormGroup>
                    <Button type="submit" bsStyle="info">
                        Add receiver
                    </Button>
                </FormGroup>
            </Form>

            );
    }
});
