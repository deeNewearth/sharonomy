'use strict';

var React = require('react');
var apiService = require('../../js/apiService');
var openChain = require('openchain');
var HoursReceived = require('./hoursReceived');
var Grid = require('react-bootstrap').Grid;
var moment = require('moment');


module.exports = React.createClass({
    getInitialState() {
        return {
            mutation:
                this.props.mutation ?
                 this.props.mutation : { receivers: [], 
                 mutationHash: this.props.params?this.props.params.mutationHash:null
                 }
        };
    },
    componentWillReceiveProps: function (nextProps) {
        this.parse(nextProps.mutationHash);
    },
    componentDidMount: function () {
        if (this.props.mutation)
            return;

        
        if (this.props.params && this.props.params.mutationHash) {
            this.parse(this.props.params.mutationHash);
        } else {
            this.setState({ error: 'mutationHash is required' });
        }
        
    },
    parse(mutationHash) {
        if (!mutationHash)
            return;

        var _this = this;
        _this.setState({ loadingData: true });

        apiService.ensureAPIClient()

        .then(function (apiClent) {
            return apiClent.getTransaction(mutationHash);
        })

        .then(function (result) {
            _this.setState({ date: moment(result.transaction.timestamp.toString(), "X").format("MMMM Do YYYY, hh:mm:ss") });
            return apiService.parseMutation(result.mutation);

        })

        .then(function (result) {

            var details = {
                mutationHash: mutationHash,
                receivers: result.accRecords.map(function (record) {
                    return {
                        user: { handle: record.key.path.parts[1] },
                        hours: record.valueDelta.toString()
                    }
                })
            };

            if (result.metadata) {
                details.description = result.metadata.description;
            }

            _this.setState({ mutation: details, error:'' });
        })

        .catch(function (err) {
            _this.setState({ error: 'failed to load :' + apiService.parseErrorMessage(err) });
        })

        .finally(function () {
            _this.setState({ loadingData: false });
        })

        ;





    },
    
    render: function() {
        return (
            <div>
                <h4 className="text-danger">{this.state.error}</h4>
                
                {
                    this.state.loadingData ?
                         <h2 className="text-muted text-center">
                            <i className="fa fa-cog fa-spin" style={{marginRight:'5px'}}></i>Loading...
                        </h2>   
                        :
                        <div className="text-center">
                            <pre className="text-muted">
                               [Mutation# {this.state.mutation.mutationHash}] 
                            </pre>
                            
                            <Grid className="well" style={{width:'100%'}}>
                                <h4>Recepients</h4>
                                {
                                    this.state.mutation.receivers?this.state.mutation.receivers.map(function (rec, i) {
                                        return (
                                        <HoursReceived key={i} receipeint={rec} />
                                        )
                                    }):''
                                }
                            </Grid>
                            <div>{this.state.date}</div>
                            <h4>Issue description</h4>
                            <p>
                                {this.state.mutation.description}
                            </p>

                            

                        </div>
                }
                
            </div>
        );
    }
});