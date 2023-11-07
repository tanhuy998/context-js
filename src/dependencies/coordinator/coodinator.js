const self = require("reflectype/src/utils/self");
const Any = require('reflectype/src/type/any.js');

/**
 * @typedef {import('../itemsManager.js')} ItemsManager
 */


/**
 *  Coordinator is class to help dependency injector resolves dependencies
 *  that are not in relationship with others, or arbitrary datas that are placed
 *  somewhere on particular section of a context.
 *  each class places data on a specific fragment of the section and is called "field"
 */
module.exports = class Coordinator extends Any {

    /**
     *  the address of the section
     */
    static key

    /**
     *  the section that places the data we want to get
     */
    /**@type {ItemsManager} */
    static field;

    static _init(_field) {

        this.field ??= _field;

        this.key = Symbol(Date.now());
    }

    #key = self(this).key;

    /**@type {ItemsManager} */
    field = self(this).field;


    #value;
    
    get value() {

        return this.#value;
    }

    get key() {

        return this.#key;
    }

    // get field() {

    //     return this.#field;
    // }
    
    #resolveValue() {

        const key = self(this).key;

        return this.field?.get(key);
    }

    _evaluate(_key) {

        if (_key === undefined || _key === null) {

            this.#value = this.#resolveValue();
        }

        const isValidKey = typeof _key === 'string' || typeof _key === 'symbol';

        const value = this.#resolveValue();

        if (!(value instanceof Object)) {

            return;
        }

        this.#value = (isValidKey) ? value[_key] : value;
    }
}

//module.exports = new Proxy(Coordinator, subCoordination);