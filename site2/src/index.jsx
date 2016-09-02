var React = require('react');
var ReactDOM = require('react-dom');
var Bootstrap = require('bootstrap/dist/css/bootstrap.css');
var PrimaryContent = require('./Body');

ReactDOM.render(
  <div>
    <h1>Hello, jsx! 8</h1>
    <PrimaryContent />
  </div>,
document.getElementById('theApp')
);