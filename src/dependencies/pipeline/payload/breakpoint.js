const Payload = require("./payload");

module.exports = class Breakpoint extends Payload {

    #rollbackPoint;

    #rollbackPayload;

    #originError;

    get originError() {

        return this.#originError;
    }

    get lastCaughtError() {

        return super.lastHandledValue;
    }

    get reason() {

        
    }
 
    get rollbackPoint() {

        return this.#rollbackPoint;
    }

    get rollbackPayload() {

        return this.#rollbackPayload;
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

        this.#rollbackPayload = _payload;

        this.#rollbackPoint = _payload.currentPhase;
    }

    setOriginError(_e) {

        this.#originError = _e;
    }
}