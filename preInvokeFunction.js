class PreInvokeFunction {

    #callback;
    #args;
    #context;

    constructor(_callback, ...args) {

        if (_callback.constructor.name == 'Function') this.#callback = _callback;

        this.#args = args;

        // return new Proxy(this, {
        //     context: this.#context,
        //     get: (target, prop) => {

        //         if (target[prop].constructor.name == 'Function') return target[prop].bind(this.context);

        //         return target[prop];
        //     },
        //     apply: (target, thisArg, args) => {

        //         //console.log('function invoked')
        //         return target.invoke();
        //     }
        // })
    }

    bind(object) {

        this.#context = object;

        return this;
    }

    invoke() {

        if (!this.#context) return this.#callback(...this.#args);

        return this.#callback.call(this.#context, ...this.#args);
    }

    passArgs(..._args) {

        this.#args = _args;

        return this;
    }

    get args() {

        return this.#args;
    }
}

module.exports = PreInvokeFunction;