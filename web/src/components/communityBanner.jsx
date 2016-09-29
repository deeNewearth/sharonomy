'use strict';
var React = require('react');
var Image = require('react-bootstrap').Image;


module.exports = React.createClass({
    

    render() {
        return (
            <div style={{textAlign: 'center', position: 'relative'}}>
                <Image src={this.props.data.avatar} responsive style={{margin: 'auto'}}/>
                <div style={{position: 'absolute',width: '100%',bottom: '10px'}}>
                    <span className="bg-primary"
                       style={{fontSize: 'xx-large', padding: '0px 20px',backgroundColor: 'rgba(119, 119, 119, 0.82)'}}>
                        {this.props.data.full_name}
                    </span>

                </div>
            </div>
            );
    }
});