'use strict';
var React = require('react');
var Glyphicon = require('react-bootstrap').Glyphicon;
var Image = require('react-bootstrap').Image;
var apiService = require('../js/apiService');
var request = require('superagent');
var withsupererror = require('../js/withsupererror');
var _ = require('lodash');


module.exports = React.createClass({
    getInitialState() {
        return this.props.data || {};
    },
    componentWillReceiveProps: function (nextProps) {
        if (!this.state || this.state.handle != nextProps.userHandle) {
            this.setState({ handle: nextProps.userHandle });

            if (!nextProps.userHandle)
                return;

            var me = this;
            apiService.getcredsAync()

            .then(function (creds) {
                return request
                    .get('/api/User/handle/' + nextProps.userHandle)
                    .set('Accept', 'application/json')
                    .authBearer(creds.token)
                    .use(withsupererror).end();

            })
            .then(function (result) {
                me.setState(result.body);
            })

            .catch(function (err) {
                me.setState({ error: 'failed to load :' + err.message });
            })
            ;
        }
    },

    render() {
        var bsStyle = _.assign(
                {marginBottom: '5px',maxWidth: '600px'},
                this.props.bsStyle || {});
        var imgStyle = _.assign(
                {width: '30%',float: 'left', marginRight: '5px'},
                this.props.imgStyle || {});
        
        return (
        <div style={bsStyle}>
            <div className="text-center" style={imgStyle}>
                <div style={{ padding: '5px' } }>
                    {this.state.avatar ?
                    <Image 
                           src={this.state.avatar} responsive style={{ margin: 'auto' }}/>
                    :<i className="fa fa-user fa-3x"></i>
                    }
               </div>
            </div>

            <div>
                {this.state.name} <small>({this.state.handle})</small>
                <br />
                <small><Glyphicon glyph="envelope" style={{ marginRight: '5px' } }/>
                    {
                        this.state.email ?
                                    this.state.email
                                    :<i className="fa fa-cog fa-spin" style={{ marginRight: '5px' } }></i>
                    }
                </small>
                <span className="text-danger">{this.state.error}</span>
                <br/>
                {
                    this.state.phone ?
                         <small>
                            <Glyphicon glyph="phone-alt" style={{ marginRight: '5px' } }/>{this.state.phone}
                         </small>
                         : ''
                }
            </div>

            <div style={{clear:'both'}}></div>
        </div>
        );
    }
});