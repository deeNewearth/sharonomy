'use strict';

var React = require('react');

var Row = require('react-bootstrap').Row;
var Column = require('react-bootstrap').Col;
var Glyphicon = require('react-bootstrap').Glyphicon;
var Image = require('react-bootstrap').Image;
var apiService = require('../../js/apiService');
var request = require('superagent');
var withsupererror = require('../../js/withsupererror');
var LinkReact = require('react-router').Link;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;


module.exports = React.createClass({
    getInitialState() {
        return { receipeint: this.props.receipeint };
    },
    componentDidMount: function () {
        if (this.state.receipeint.user.email)
            return;

        //else we need to load User details
        var me = this;
        apiService.getcredsAync()

        .then(function (creds) {
            return request
                .get('/api/User/handle/' + me.state.receipeint.user.handle)
                .set('Accept', 'application/json')
                .authBearer(creds.token)
                .use(withsupererror).end();

        })
        .then(function (result) {
            me.state.receipeint.user = result.body;
            me.setState({ receipeint: me.state.receipeint });
        })

        .catch(function (err) {
            me.setState({ error: 'failed to load :' + err.message });
        })
        ;
    },
    
    render: function () {
        const detailsTooltip = (
            <Tooltip id="detailsTooltip">Show transaction history</Tooltip>
        );

        return (
            <Row>
                    
                <Column xs={4} className="text-center">
                        <div style={{ border: 'solid 1px #ddd', padding: '5px' } }>
                            {this.state.receipeint.user.avatar ?
                                <Image 
                                   src={this.state.receipeint.user.avatar} responsive style={{ margin: 'auto' }}/>
                                :<i className="fa fa-user fa-inverse fa-3x"></i>
                            }
                        </div>
                </Column>
                    
                <Column xs={8 } className="text-left">
                    {this.state.receipeint.user.name} 
                    <small>
                    (
                        <OverlayTrigger placement="bottom" overlay={detailsTooltip}>
                            <LinkReact to={'/txhistory/' + this.state.receipeint.user.handle }>
                                {this.state.receipeint.user.handle}
                            </LinkReact>
                        </OverlayTrigger>
                        
                    )
                    </small>
                    <p>
                            <strong>{this.state.receipeint.hours} hours(s)</strong>
                                    
                                    
                        <br />
                        <small><Glyphicon glyph="envelope" style={{ marginRight: '5px' } }/>
                            {
                                this.state.receipeint.user.email?
                                    this.state.receipeint.user.email
                                    :<i className="fa fa-cog fa-spin" style={{ marginRight: '5px' } }></i>
                            }
                        </small>
                        <span className="text-danger">{this.state.error}</span>
                        <br/>
                        {
                            this.state.receipeint.user.phone ?
                                <small>
                                    <Glyphicon glyph="phone-alt" style={{ marginRight: '5px' } }/>{this.state.receipeint.user.phone}
                                </small>
                                : ''
                        }
                        
                     </p>
                     <hr/>
                </Column>
            </Row>
        );
}
});