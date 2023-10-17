
module.exports = class ContextHandler {

    #context;

    get context() {

        return this.#context;
    }

    constructor(_context) {

        this.#context = _context;
    }

    handle() {


    }
}