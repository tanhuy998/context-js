
module.exports = class ContextHandler {

    #context;

    #devise;

    get context() {

        return this.#context;
    }

    get devise() {

        return this.#devise;
    }

    constructor(_context, _devise) {

        this.#context = _context;
        this.#devise = _devise;
    }

    handle() {


    }
}