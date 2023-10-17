const Context =  require('../context/context.js');

module.exports = class Contextual {

    /**@type {Context}*/
    #context;

    get context() {

        return this.#context;
    }

    constructor(_context) {

        this.#context = _context;

        this.#init();
    };

    #init() {

        if (!(this.#context instanceof Context)) {

            throw new TypeError('[DependenciesInjecttionEngine] must be initialized with an instance of [Context]');
        }
    }
}