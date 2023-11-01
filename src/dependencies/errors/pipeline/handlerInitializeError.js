const PhaseError = require("./phaseError");

module.exports = class HanlderInitializeError extends PhaseError {

    #handlerAbstract;

    get _handlerAbstract() {

        return this.#handlerAbstract;
    }

    constructor(_phase, _pipeLine, _payload, _handlerAbstract) {

        super(...arguments);

        this.#handlerAbstract = _handlerAbstract;

        this.message = `theres\'s an error when initialize handler of type [${_handlerAbstract?.name ?? _handlerAbstract}]`;
    }
}