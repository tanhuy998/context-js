const {EventEmitter} = require('node:events');
const reflectFunction = require('../libs/reflectFunction.js');

module.exports = class AbstractPreInvokeFunction extends EventEmitter {

    #callback;
    #args;
    #context;
    #functionMeta;

    get functionMeta() {

        return this.#functionMeta;
    }

    get context() {

        return this.#context;
    }

    get callback() {

        return this.#callback;
    }

    get args() {

        return this.#args;
    }

    constructor(_callback, ...args) {

        super({captureRejections: true});

        this.#callback = _callback;

        this.#args = args;

        this.#functionMeta = reflectFunction(_callback);
    }


    whenFulfill(_callback) {

        this.on('fulfill', _callback);
    }

    passArgs(..._args) {

        this.#args = _args;

        return this;
    }

    bind(object) {

        this.#context = object;

        return this;
    }
}