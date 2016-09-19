'use strict';

var React = require('react');
var ReactDom  = require('react-dom');
var AvatarCropper = require("react-avatar-cropper");
var Image = require('react-bootstrap').Image;
require('./avatar.css');

var FileUpload = React.createClass({

    handleFile: function(e) {
        var reader = new FileReader();
        var file = e.target.files[0];

        if (!file) return;

        reader.onload = function(img) {
            ReactDom.findDOMNode(this.refs.in).value = '';
            this.props.handleFileChange(img.target.result);
        }.bind(this);
        reader.readAsDataURL(file);
    },

    render: function() {
        return (
          <input ref="in" type="file" accept="image/*" onChange={this.handleFile} />
      );
}
});

module.exports = React.createClass({
    getInitialState: function() {
        return {
            cropperOpen: false,
            img: null,
            croppedImg: this.props.Src
        };
    },
    handleFileChange: function(dataURI) {
        this.setState({
            img: dataURI,
            croppedImg: this.state.croppedImg,
            cropperOpen: true
        });
    },
    handleCrop: function (dataURI) {

        if (this.props.onChange) {
            this.props.onChange(dataURI);
        }

        this.setState({
            cropperOpen: false,
            img: null,
            croppedImg: dataURI
        });
    },
    handleRequestHide: function() {
        this.setState({
            cropperOpen: false
        });
    },
    render () {
        return (
          <div>
            <div className="avatar-photo">
              <FileUpload handleFileChange={this.handleFileChange} />
              <div className="avatar-edit">
                <span>Click to Pick Avatar</span>
                <i className="fa fa-camera"></i>
              </div>
              <Image src={this.state.croppedImg} responsive/>
            </div>
        {this.state.cropperOpen &&
          <AvatarCropper
            onRequestHide={this.handleRequestHide}
            cropperOpen={this.state.cropperOpen}
            onCrop={this.handleCrop}
            image={this.state.img}
            width={400}
            height={400}
          />
            }
        </div>
      );
    }
});