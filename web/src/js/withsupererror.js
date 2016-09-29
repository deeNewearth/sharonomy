var superagent = require('superagent');
var when = require('when');

function plugin(request) {
    var promise = when.promise(function (resolve, reject) {
        request.on('response', function (results) {

            if (results.error || !results.body){
                var err= {message:'Request failed'};
                if (results.body) {
                    if (results.body.message)
                        err.message = results.body.message;
                    if (results.body.errors)
                        err.errors = results.body.errors;
                }
                reject(err);
                return;
            }

            resolve(results);
        });
        request.on('error', reject);
    });

    request.then = function then(onFulfilled, onRejected) {
        return promise.then(onFulfilled, onRejected);
    };
}

module.exports = plugin;
