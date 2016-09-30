'use strict';
var React = require('react');
var apiService = require('../../js/apiService');
var Loader = require('../loader');
var RSVP = require('rsvp');
var moment = require('moment');
var Button = require('react-bootstrap').Button;
var Modal = require('react-bootstrap').Modal;
var ShowTx = require('../issueHours/showTransaction');

var TxRow = React.createClass({
    getInitialState() {
        return { record: {} };
    },
    onMutClicked(){
        this.setState({ showModal: true });
    },
    close() {
        this.setState({ showModal: false });
    },

    componentDidMount() {
        var me = this;
        apiService.ensureAPIClient()

        .then(function (apiClent) {
            return apiClent.getTransaction(me.props.mutHash);
        })
        .then(function (result) {
            return RSVP.hash({
                date: moment(result.transaction.timestamp.toString(), "X").format("MM/DD/YYYY"),
                mutation: apiService.parseMutation(result.mutation)
            });
            
        })

        .then(function (results) {
            var record = {
                loaded: true
            };

            if (results.mutation.accRecords.length > 0) {
                //0 acRecords means creation or dummy record
                record.date= results.date;
                record.description = (results.mutation.metadata.description || '').substring(0, 25);
                record.value = results.mutation.accRecords[0].value.toString();
                record.delta = results.mutation.accRecords[0].valueDelta.toString();
            }
            
            me.setState({ record: record});
        })
        .catch(function (err) {
            me.setState({ error: 'failed to load : ' + err.message, record: { loaded :true} });
        })
        ;
    },
    render() {

        var txDetails =
            <Modal show={this.state.showModal} onHide={this.close}>
                <Modal.Header closeButton>
                    <Modal.Title>Transaction details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ShowTx mutationHash={this.state.showModal?this.props.mutHash:null}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.close}>Close</Button>
                </Modal.Footer>
            </Modal>;
        

        return (
            <tr>
                
                <td width="20%" >
                    {this.state.record.date}
                    {txDetails}
                </td>
                <td width="50%">
                        {this.state.record.description?
                            <Button onClick={this.onMutClicked} style={{padding:'0px'}}
                           bsStyle="link">{this.state.record.description}</Button>:''}
                        
                       
                       <span className="text-danger">{this.state.error}</span>
                       {this.state.record.loaded?'':
                            <i className="fa fa-cog fa-spin" ></i>}
                </td>
                <td width="15%" className="text-right" style={{paddingRight:'5px'}}>{this.state.record.delta}</td>
                <td width="15%" className="text-right" style={{paddingRight:'5px'}}>{this.state.record.value}</td>
            </tr>
            );
    }
});

module.exports = React.createClass({
    getInitialState() {
        return {}
    },
    componentWillMount() {
        var me = this;

        RSVP.hash({
            creds: apiService.getcredsAync(),
            apiClent: apiService.ensureAPIClient()
        })

        .then(function (results) {
            var key = '/aka/' + results.creds.decoded.unique_name + '/:ACC:' + apiService.getAssetName();
            //var t = openChain.encoding.encodeString(key);

            return results.apiClent.getRecordMutations(key);
        })

        .then(function (mutations) {
            var transactions = mutations.map(function (item) { return item.toHex(); });
            me.setState({ transactions: transactions });
        })

        .catch(function (err) {
            me.setState({ error: 'Failed to load history :' + err.message, transactions: [] });
        })
        ;

    },
    render() {

        return (
            <div className="container">
                <h3>Transaction history</h3>
                <Loader loaded={this.state.transactions}>
                
                <table style={{width:'100%'}} className="balanceTable">
                    <thead>
                        <tr>
                            <td>Date</td><td>Description</td>
                            <td className="text-right">Hours</td><td className="text-right">Balance</td>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        (this.state.transactions||[]) .map(function (hash, i) {
                            return (
                                    <TxRow key={i} mutHash={hash} ></TxRow>
                                   );
                            })
                    }
                    </tbody>
                </table>
                
            </Loader>
            </div>
            
        );
    } 
});
