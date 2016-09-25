'use strict';

var React = require('react');

var Row = require('react-bootstrap').Row;
var Column = require('react-bootstrap').Col;
var Glyphicon = require('react-bootstrap').Glyphicon;


module.exports = React.createClass({
    getInitialState() {
        return { receipeint: this.props.receipeint };
    },
    
    render: function() {
        return (
            <Row>
                    
                <Column xs={4} className="text-center">
                        <div style={{ border: 'solid 1px #ddd', padding: '5px' } }>
                            <i className="fa fa-user fa-inverse fa-3x"></i>
                        </div>
                </Column>
                    
                <Column xs={8 } className="text-left">
                    {this.state.receipeint.user.name} <small>({this.state.receipeint.user.handle})</small>
                    <p>
                            <strong>{this.state.receipeint.hours} hours(s)</strong>
                                    
                                    
                        <br />
                        <small><Glyphicon glyph="envelope" style={{ marginRight: '5px' } }/>
                            {this.state.receipeint.user.email}</small><br/>
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