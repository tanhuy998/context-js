/**
 * @typedef {import('../context/context.js')} Context
 */

const self = require('reflectype/src/utils/self.js');
const {decorateLockedMethod} = require('./decorateLockedMethod.js');
const metadata = require('../../utils/metadata.js');
const { CONTEXT_LOCK } = require('./constant.js');

module.exports = class ContextLockable {

    /**@type {Set<typeof Context>} */
    static contextRegistry = new Set();

    /**
     * 
     * @param {typeof Context} _contextType 
     */
    static lockOn(_contextType) {

        this.contextRegistry.add(_contextType);
    }
    
    /**
     * 
     * @param {typeof Context | Context} _context 
     * @returns {boolean}
     */
    static hasRegistryOf(_context) {

        if (typeof _context !== 'function') {

            _context = self(_context);
        }

        return this.contextRegistry.has(_context);
    }


    /**@type {Context} */
    #context;

    #isLocked = false;

    lockActions;

    /**@returns {boolean} */
    get isLocked() {

        return this.#isLocked;
    }

    /**@returns {Context} */
    get context() {

        return this.#context;
    }

    get #isActionLockedByDecorator() {

        const meta = metadata(self(this));

        if (typeof meta !== 'object') {

            return false;
        }

        return meta[CONTEXT_LOCK];
    }

    constructor(_context) {

        this.#context = _context;

        this.#init();
    }

    #init() {

        const context = this.#context;

        if (self(this).hasRegistryOf(context)) {
            
            this.#isLocked = context.isLocked;

            this.#initializeLockedActions();
        }
    }

    

    #initializeLockedActions() {

        if (this.#isActionLockedByDecorator) {
            
            return;
        }

        let lockedActions = self(this).lockActions;
        
        lockedActions = Array.isArray(lockedActions) ? lockedActions : [];

        for (const action of lockedActions) {
            
            const method = this[action];

            if (typeof method !== 'function') {

                continue;
            }

            this[action] = decorateLockedMethod(method);
        }
    }


    /**
     * 
     * @param {Context} _context 
     */
    setContext(_context) {

        if (!this.#context) {

            this.#context = _context;

            this.#init();
        }
    }
}