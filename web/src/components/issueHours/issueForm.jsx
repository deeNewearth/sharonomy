'use strict';
var React = require('react');


var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Column = require('react-bootstrap').Col;


var form = require('react-bootstrap').form;
var FormGroup = require('react-bootstrap').FormGroup;
var ControlLabel = require('react-bootstrap').ControlLabel;
var FormControl = require('react-bootstrap').FormControl;
var HelpBlock = require('react-bootstrap').HelpBlock;
var Button = require('react-bootstrap').Button;
var Tooltip = require('react-bootstrap').Tooltip;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Glyphicon = require('react-bootstrap').Glyphicon;

var NewReceiver = require('./newReceiver');

var apiService = require('../../js/apiService');
var openChain = require('openchain');
var RSVP = require('rsvp');
var Long = require('Long');



module.exports = React.createClass({
    clearAll() {
        return {
            receivers: [],
            description: '',
            savingData: false,
            selectedReceiver: {},
            errors: {}
        };
    },
    getInitialState() {
        return this.clearAll();
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
        else if (tmp.length==1) {
            this.setState({ selectedReceiver: {} });
        }
        
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

        var me = this;
        RSVP.hash({
            key: apiService.getKeyAync(),
            apiClent: apiService.ensureAPIClient()
        })

        .then(function (results) {
            var transaction = new openChain.TransactionBuilder(results.apiClent);
            transaction.key = results.key;
            transaction.setMetadata({creator:'sharonomy',description:me.state.description});

            var records = [transaction];
            var totalHours = 0;
            me.state.receivers.map(function (rec, i) {
                totalHours += parseInt(rec.hours);
                records.push(transaction.updateAccountRecord(
                    '/aka/'+rec.user.handle+'/',
                    apiService.getAssetName(),
                    Long.fromString(rec.hours)));
            });

            records.push(transaction.updateAccountRecord(
                apiService.getTreasuryAccount(),
                apiService.getAssetName(),
                Long.fromString('-' + totalHours)));

            return RSVP.all(records);
        })

        .then(function (results) {
            var transaction = results[0];

            var signer = new openChain.MutationSigner(transaction.key);
            transaction.addSigningKey(signer);

            return transaction.submit();
        })

        .then(function (results) {
            var issue = {
                receivers: me.state.receivers,
                description: me.state.description,
                mutationHash: results.mutation_hash
            };
            me.setState(me.clearAll());
            if (me.props.onIssue)
                me.props.onIssue(issue);
            
        })

        .catch(function (err) {
            me.setState({ errors: { form :'failed to issue :' + err.data.error_code} });
        })

        .finally(function () {
            me.setState({ savingData: false });
        })

        ;

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
                <Row key={i} >
                    
                    <Column xs={4} className="text-center">
                        <div style={{ border: 'solid 1px #ddd', padding: '5px' } }>
                            <i className="fa fa-user fa-inverse fa-3x"></i>
                        </div>
                    </Column>
                    
                    <Column xs={8 }>
                        {rec.user.name} <small>({rec.user.handle})</small>
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
                        <small><Glyphicon glyph="envelope" style={{marginRight: '5px'}}/>{rec.user.email}</small><br/>
                        {
                            rec.user.phone ?
                                <small>
                                    <Glyphicon glyph="phone-alt" style={{ marginRight: '5px' } }/>{rec.user.phone}
                                </small>
                                : ''
                        }
                        
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
                <h3 className="text-center">Issuing hours for community work</h3>
                {this.state.receivers.length>0?
                <div className="well">
                    <h4>Recepients :</h4>{recepientTable}
                </div>
                :''
                }
                
                {
                this.state.selectedReceiver?
                    <div>
                        <h4>{this.state.selectedReceiver.handle?'Update':'Choose'} recepient:</h4>
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