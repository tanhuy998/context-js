const { ABORT_PIPELINE, ROLL_BACK, DISMISS} = require('../../constants');

function isControlSignal(_value) {

    return [ABORT_PIPELINE, DISMISS, ROLL_BACK].includes(_value);
}

module.exports = isControlSignal;