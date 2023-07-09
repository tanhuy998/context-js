

module.exports = class RuntimeError extends Error {

    #origin;

    get origin() {

        return this.#origin;
    }

    constructor(_originError) {

        super(_originError.message);

        this.#origin = _originError;
    }
}