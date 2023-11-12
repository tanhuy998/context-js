const { ABORT_PIPELINE, ROLL_BACK, DISMISS, DISMISS_ERROR_PHASE} = require('../../constants');

function isRedirectSignal(_value) {

    return [ABORT_PIPELINE, DISMISS, ROLL_BACK].includes(_value);
}

function isErrorHandlerControlSignal(_value) {

    return [DISMISS_ERROR_PHASE].includes(_value);
}

module.exports = {isRedirectSignal, isErrorHandlerControlSignal};