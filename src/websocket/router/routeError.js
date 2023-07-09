const RuntimeError = require('../../error/rumtimeError.js')

module.exports = class RouteError extends RuntimeError {

    #breakpoint;

    get breakpoint() {

        return this.#breakpoint;
    }

    constructor(_origin, {breakpoint}) {

        super(_origin);

        this.#breakpoint = breakpoint;
    }
}