module.exports = class PhaseError extends Error {

    phase;
    pipeline;
    context;

    reason;

    // get phase() {

    //     return this.#phase;
    // }

    // get pipeLine() {

    //     return this.#pipeline;
    // }

    // get context() {

    //     return this.#context;
    // }

    // get reason() {

    //     return this.#reason;
    // }

    constructor(_phase, _pipeLine, _payload, reason) {

        super('thers\'s an error when handle request');

        this.phase = _phase;
        this.pipeline = _pipeLine;
        this.context = _payload;
        this.reason = reason;
    }
}