'use strict';
var React = require('react');
var Glyphicon = require('react-bootstrap').Glyphicon;


module.exports =React.createClass({
    render() {
        return (
        <div style={{width:'300px',marginBottom:'5px'}}>
            <div className="text-center" style={{float: 'left',marginRight: '5px'}}>
                <div style={{ border: 'solid 1px #ddd', padding: '5px' } }>
                            <i className="fa fa-user fa-3x"></i>
               </div>
            </div>

            <div>
                {this.props.data.name} <small>({this.props.data.handle})</small>
                <br />
                <small><Glyphicon glyph="envelope" style={{ marginRight: '5px' } }/>{this.props.data.email}</small>
                <br/>
                {
                    this.props.data.phone ?
                         <small>
                            <Glyphicon glyph="phone-alt" style={{ marginRight: '5px' } }/>{this.props.data.phone}
                         </small>
                         : ''
                }
            </div>

            <div style={{clear:'both'}}></div>
        </div>
        );
    }
});