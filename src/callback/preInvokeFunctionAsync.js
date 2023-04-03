const {EventEmitter} = require('node:events');

module.exports = class PreInvokeFunctionAsync extends EventEmitter{

    #callback;
    #args;
    #context;
    // #functionMeta;

    // get functionMeta() {

    //     return this.#functionMeta;
    // }

    constructor(_callback, ...args) {

        super();

        if (typeof _callback != 'function') {

            throw new TypeError('invalid argument type passed to PreInvokeFunction\'s constructor');
        }


        this.#callback = _callback;
        // if (_callback.constructor.name == 'AsyncFunction') {

        //     this.#callback = _callback;
        // }
        // else {

        //     throw new NotAcceptAsyncFunctionError();
        // }

        this.#args = args;

        //this.#functionMeta = reflectFunction(_callback);

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

        this.#Init();
    }

    #Init() {

        this.#InitEvents();
    }

    #InitEvents() {

        this.on('fulfill', (_result, target, method) => {});
    }

    bind(object) {

        this.#context = object;

        return this;
    }

    async invoke() {

        let targetFunction;

        if (!this.#context) {

            targetFunction =  this.#callback;
        }
        else {

            targetFunction = this.#callback.bind(this.#context);
        }

        //const result = this.#callback.call(this.#context, ...this.#args)

        let result;

        result = await targetFunction(...this.#args)

        // if (this.#functionMeta.isAsync) {

        //     result = targetFunction(...this.#args);
        // }
        // else {

        //     result = targetFunction(...this.#args)
        // }

        this.emit('fulfill', result, this.#callback ,this.#context);

        return result;
    }
    
    whenFulfill(_callback) {

        this.on('fulfill', _callback);
    }

    passArgs(..._args) {

        this.#args = _args;

        return this;
    }

    get args() {

        return this.#args;
    }
}

