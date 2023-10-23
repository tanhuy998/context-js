const self = require("reflectype/src/utils/self");
const preventModifyProp = require("../proxyTraps/preventModifyProp");
const Any = require('reflectype/src/type/any.js');


class Coordinator extends Any {

    static key = Symbol(Date.now());
    static field;

    static _init(_field) {

        this.field ??= _field;
    }

    #key = self(this).key;
    #field = self(this).field;

    #value;
    
    get value() {

        return this.#value;
    }

    get key() {

        return this.#key;
    }

    get field() {

        return this.#field;
    }
    
    #resolveValue() {

        const key = self(this).key;

        return this.#field?.get(key);
    }

    _evaluate(_key) {

        const isValidKey = typeof _key === 'string' || typeof _key === 'symbol';

        const value = this.#resolveValue();

        if (!(value instanceof Object)) {

            return;
        }

        this.value = (isValidKey) ? value[_key] : value;
    }
}

module.exports = new Proxy(Coordinator, preventModifyProp);