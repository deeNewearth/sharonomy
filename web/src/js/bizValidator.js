'use strict';
var _ = require('lodash');

module.exports =  function(component, schema) {
    
    this.fields = schema,

    this.reset = function () {
        this.showErrors = false;
    };

    this.isValid = function() {
        this.showErrors = true;
        var valid = true;
        var me = this;
        Object.keys(this.fields).forEach(function (field) {
            if ('error' == me.validate(field)) {
                valid = false;
            }
        });
        return valid;
    };

    this.changed =function(field){
        if (this.ProcessingErrors && this.ProcessingErrors[field])
            delete this.ProcessingErrors[field];
    }

    this.HandleProcessingError = function (err, saveMessage) {
        var message = null;
        if (err.response && err.response.body) {
            this.ProcessingErrors = err.response.body.errors;
            message = err.response.body.message;
        }

        if (!this.ProcessingErrors)
            this.ProcessingErrors = {};

        if (!this.ProcessingErrors.form) {
            this.ProcessingErrors.form = saveMessage + ' : ' + message || (err.message || '');
        }

        component.setState({ Errors: this.ProcessingErrors });
    }

    this.validate = function (field) {

        var errors = component.state.Errors || {};
        var changed = false;

        var errorStatus = {};

        if (this.showErrors && this.fields[field]) {
            errorStatus.ret = 'success';

            if (!component.state[field] && this.fields[field].required) {
                errorStatus.errorString = 'This is required';
            }

            else if (this.fields[field].minimum && component.state[field]
                && component.state[field].length < this.fields[field].minimum) {

                errorStatus.errorString = 'Must be more then ' + this.fields[field].minimum + ' characters';
            }

            else if (this.fields[field].max_value && component.state[field]
                && component.state[field] > this.fields[field].max_value) {

                errorStatus.errorString = 'Must be less then ' + this.fields[field].max_value;
            }

            else if (this.fields[field].regex && component.state[field]
                && !this.fields[field].regex.test(component.state[field])) {
                errorStatus.errorString = 'not a valid ' + field
            }

            else if (this.ProcessingErrors && this.ProcessingErrors[field]) {
                errorStatus.errorString = this.ProcessingErrors[field];
            }

            if (errorStatus.errorString)
                errorStatus.ret = 'error';
            else if (this.fields[field].custom) {
                var t = this.fields[field].custom(this, component);
                if (t)
                    errorStatus = t;
            }
        }

        if (component.state.Errors[field] != errorStatus.errorString) {
            var errors = component.state.Errors;
            errors[field] = errorStatus.errorString;
            _.delay(function () {
                component.setState({ Errors: errors });
            }, 10);
            
        }



        if (errorStatus.ret)
            return errorStatus.ret;
        else
            return; //cause we need to return undefined and not null for no validation state

    };

    
}