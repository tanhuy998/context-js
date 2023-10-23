const self = require('reflectype/src/utils/self.js');
const {set} = require('../proxyTraps/preventModifyProp.js');
const Coordinator = require('./coodinator.js');


/**
 * @typedef {import('../context/context.js')} Context
 * @typedef {import('../itemsManager.js')} ItemsManager
 */

module.exports = class SessionCoordinator extends Coordinator {

    /**@type {ItemsManager} */
    #lookupField;
    
    /**@type {Context} */
    #context;

    //#value;

    get context() {

        return this.#context;
    }

    /**
     * 
     * @param {Context} _context 
     */
    constructor(_context, _key) {

        super(...arguments);

        this.#context = _context;

        this.#init();
    }

    #init() {

        this.#lookupField = this.#context.session;
    }

    #resolveValue() {

        const key = self(this).key;

        return this.#lookupField.get(key);
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

//module.exports = new Proxy(SessionCoordinator, traps);