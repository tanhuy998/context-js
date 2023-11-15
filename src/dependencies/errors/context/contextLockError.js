const self = require("reflectype/src/utils/self");
const ContextError = require("./contextError.js");

/**
 * @typedef {import('../../context/context.js')} Context
 * @typedef {import('../../lockable/contextLockable.js')} ContextLockable
 */

module.exports = class ContextLoackError extends ContextError {

    /**
     * 
     * @param {ContextLockable} _contextLockableObj 
     * @param {string | symbol} _method 
     * @param {Context} _contextObj 
     */
    constructor(_contextLockableObj, _method, _contextObj) {
        	
        const contextLockClass = self(_contextLockableObj).name;

        const lockedMethodName = typeof _method === 'symbol' ? _method.toString() : _method;

        const contextClass = self(_contextObj).name;

        super(`[${contextLockClass}].${lockedMethodName}() is context locked method that cannot be invoked while [${contextClass}] locked`);
    }
}