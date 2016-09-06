'use strict';
var React = require('react');

var Link = require('react-router').Link;

var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Column = require('react-bootstrap').Col;


var form = require('react-bootstrap').form;
var FormGroup = require('react-bootstrap').FormGroup;
var ControlLabel = require('react-bootstrap').ControlLabel;
var FormControl = require('react-bootstrap').FormControl;
var HelpBlock = require('react-bootstrap').HelpBlock;
var Button = require('react-bootstrap').Button;
var InputGroup = require('react-bootstrap').InputGroup;
var Tooltip = require('react-bootstrap').Tooltip;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Form = require('react-bootstrap').Form;
var Label = require('react-bootstrap').Label;

var NewReceiver = React.createClass({
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

    render: function () {
        const receiverTooltip = (
            <Tooltip id="receiverTooltip">Please enter receiver's handle</Tooltip>
        );
        const searchTooltip = (
            <Tooltip id="searchTooltip">Search for registered users</Tooltip>
        );


        return (

            <Form inline onSubmit={this.onAddUser} className="forminLinewithHelpBlock">
                <FormGroup validationState={this.ishandleValid() }>
                    <InputGroup>
                        <InputGroup.Addon><OverlayTrigger placement="right" 
                                                          overlay={receiverTooltip}>
                            <i className="fa fa-user"></i>
                            </OverlayTrigger>
                        </InputGroup.Addon>
                        <FormControl type="text" style={{ minWidth: '150px' }}
                                        value={this.state.handle} onChange={this.OnhandleChange} 
                                        placeholder="Receiver's handle"/>
                        <InputGroup.Button>
                            <Button><OverlayTrigger placement="left" 
                                                      overlay={searchTooltip}>
                                        <i className="fa fa-search"></i>
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



module.exports = React.createClass({
    getInitialState() {
        return {
            receivers: [],
            description: '',
            savingData: false,
            selectedReceiver: {},
            errors: {}
        };
    },
    OnDescriptionChange(e) {
        if (this.state.savingData)
            return;

        if (this.state.errors.description)
            this.setState({ errors: {} });

        this.setState({ description: e.target.value });
    },

    addRecieverRow(recv) {
        this.setState({ receivers: this.state.receivers.concat([recv]) });
        this.setState({selectedReceiver:null});
    },

    onEditclicked(arg) {
        if (this.state.savingData)
            return;

        if (typeof arg.index === 'undefined') {
            this.setState({ selectedReceiver: {} });
            return;
        }

        var tmp = this.state.receivers;

        if(!arg.remove)
            this.setState({ selectedReceiver: tmp[arg.index] });
        
        tmp.splice(arg.index, 1);
        this.setState({receivers:tmp}) 
    },

    
    OnSubmit(e) {
        e.preventDefault();

        var errList= {};

        if (this.state.receivers.length < 1) {
            errList.form = 'There are no recipients';
        }

        if (this.state.description.length < 20) {
            errList.description = 'The description needs to be at least 20 characters';
        }

        
        this.setState({ errors: errList });

        if (Object.keys(errList).length > 0)
            return;

        this.setState({ savingData: true });
    },
    

    render: function () {
        const deleteTooltip = (
            <Tooltip id="deleteTooltip">Remove this recepient</Tooltip>
        );
        const editTooltip = (
            <Tooltip id="editTooltip">change Hours to be issued</Tooltip>
        );
        var me = this;

        var recepientTable = (
            <Grid>
            {
                this.state.receivers.map(function (rec, i) {
                return (
                <Row key={i} style={{ margin: '10px 0px' } }>
                    
                    <Column xs={4} className="text-center">
                        <div style={{ border: 'solid 1px #ddd', padding: '5px' } }>
                            <i className="fa fa-user fa-inverse fa-3x"></i>
                        </div>
                    </Column>
                    
                    <Column xs={8 }>
                        Marlin Jones <small>({rec.handle})</small>
                        <p><strong>{rec.hours} hours(s)</strong>
                        <OverlayTrigger placement="bottom" overlay={deleteTooltip}>
                            <Button onClick={me.onEditclicked.bind(null, { index:i, remove:true })}
                                    bsStyle="link" style={{ color: 'red', padding: '0px 5px' } }>
                                <i className="fa fa-remove"></i>
                            </Button>
                        </OverlayTrigger>
                        
                        <OverlayTrigger placement="bottom" overlay={editTooltip}>
                            <Button onClick={me.onEditclicked.bind(null, { index:i })}
                                    bsStyle="link" style={{ padding: '0px' } }>
                                <i className="fa fa-edit"></i>
                            </Button>
                        </OverlayTrigger>
                                    
                                    
                        <br />
                        <small>thj87@gmail.com</small>
                        </p>
                        <hr/>
                </Column>
            </Row>
                )
                })
            }
            {
                this.state.selectedReceiver ?
                '':
                <Row>
                    <Column xs={4}></Column>
                    <Column xs={8}>
                        <Button onClick={me.onEditclicked.bind(null, { })}
                                bsStyle="link">
                            <i className="fa  fa-plus-circle"></i>Add another recepient
                        </Button>
                    </Column>
                </Row>
            }
                
            </Grid>);
        
        return (
            <div>
                <div>Navigation : <Link to="/edit">edit</Link></div>

                <div className="well">
                    <h4>Recepients :</h4>{recepientTable}
                </div>
                
                {
                this.state.selectedReceiver?
                    <div>
                        <h4>{this.state.selectedReceiver.handle?'Update':'Add'} recepient:</h4>
                            <NewReceiver recepient={this.state.selectedReceiver}
                                addNewRecepient={this.addRecieverRow} />
                    </div>
                    :''
                }
                


                <form onSubmit={this.OnSubmit}>

                    <FormGroup controlId="descriptionText"
                               validationState={this.state.errors.description?'error':null}>
                        <ControlLabel>These hours are being issued for :</ControlLabel>
                        <FormControl componentClass="textarea" style={{minHeight:'100px'}}
                            value={this.state.description} onChange={this.OnDescriptionChange}
placeholder="Please enter detailed description. Example: time contributed by volunteers fixing the school's roof"
                                   />
                        <FormControl.Feedback />
                        <HelpBlock>{this.state.errors.description}</HelpBlock>
                    </FormGroup>

                    <div style={{margin:'20px'}} className="text-center">
                        <div className="text-danger">{this.state.errors.form}</div>
                        <Button type="submit" bsStyle="success" bsSize="large" block
                                disabled={this.state.savingData}>
                            Issue Hours
                            {
                            this.state.savingData ?
                                  <i className="fa fa-cog fa-spin" style={{marginRight:'5px'}}></i> : ''
                            }
                        </Button>

                    </div>
                </form>
            </div>
        );
    }
});