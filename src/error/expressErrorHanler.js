const RuntimeError = require('./rumtimeError.js');

module.exports = function (error, req, res, next) {

    const runtimeError = new RuntimeError(error);

    next(runtimeError);
}