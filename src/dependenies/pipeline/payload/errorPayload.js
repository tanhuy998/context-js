const Payload = require("./payload");

module.exports = class ErrorPayload extends Payload {

    #rollbackPoint;

    get lastError() {

        return super.last;
    }
 
    get rollbackPoint() {

        return this.#rollbackPoint;
    }

    /**
     * 
     * @param {*} _context 
     * @param {*} _controller 
     * @param {*} _pipeline 
     * @param {Payload} _payload 
     */
    constructor(_context, _controller, _pipeline, _payload) {

        super(...arguments);

        this.#rollbackPoint = _payload.currentPhase;
    }
}