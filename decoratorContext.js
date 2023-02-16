class D_Context {

    static #contextList = {};
    static #callbackQueue = [];

    static #currentContext;


    static get currentContext() {

        return this.#currentContext;
    }

    // static set currentContext(_value) {

    //     this.#currentContext = _value;
    // }

    static get context() {

        return this.#contextList;
    }

    constructor() {


    }

    static assignContext(symbol, _constructor) {

        this.context[symbol] = _constructor;

    }/////////////////////////

    static defineContext(symbol) {

        //const symbol = Symbol(key);

        this.#currentContext = symbol;

        this.context[symbol] = 1;

        //Route.currentContext
    }////////////////////////
}

function extendsDecoratorContextClass(_extendClass) {

    const contextList = {};
    const callbackQueue = [];

    let currentContext;

    Object.defineProperty(_extendClass, '#contextList', {
        value: {},
        get: () => {
            return contextList;
        }
    })

    Object.defineProperty(_extendClass, '#callbackQeue', {
        value: {},
        get: () => {
            return contextList;
        }
    })

    Object.defineProperty(_extendClass, '#contextList', {
        value: {},
        get: () => {
            return contextList;
        }
    })


    // static #contextList = {};
    // static #callbackQueue = [];

    // static #currentContext;

    return _extendClass;
}

module.exports = extendsDecoratorContextClass;