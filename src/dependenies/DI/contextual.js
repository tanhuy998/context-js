module.exports = class Contextual {

    #context;

    get context() {

        return this.#context;
    }

    constructor(_context) {

        this.#context;

        this.#init();
    };

    #init() {

        if (!(this.#context instanceof Context)) {

            throw new TypeError('[DependenciesInjecttionEngine] must be initialized with an instance of [Context]');
        }
    }
}