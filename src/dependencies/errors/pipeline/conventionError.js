module.exports = class ConventionError extends Error {

    #reason;

    get reason() {

        return this.#reason;
    }
    constructor(message, reason) {

        super(message);

        this.#reason = reason;
    }
}