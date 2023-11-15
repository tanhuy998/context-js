const { property_metadata_t } = require('reflectype/src/reflection/metadata.js');
const self = require('reflectype/src/utils/self.js');
const metadata = require('../../utils/metadata.js');
const { CONTEXT_LOCK } = require('./constant.js');
const ContextLoackError = require('../errors/context/contextLockError.js');
const ConventionError = require('../errors/conventionError.js');


/**
 * @typedef {import('./contextLockable.js')} ContextLockable
 * @typedef {import('../context/context.js')} Context
 */

/**
 * @this ContextLockable
 * 
 * @param {Function} _func 
 * @param {string} _name
 */
function decorateLockedMethod(_func, _name) {

    const lockedFunction = function() {
        /**@type {Context} */
        const context = this.context;

        const isValidContext = context !== undefined && context !== null;
        
        if (isValidContext && self(this).hasRegistryOf(context) && context.isLocked) {

            const err = new ContextLoackError(this, _name, context);

             throw new ConventionError(err.message, err);
        }

        return _func.call(this, ...arguments);
    };

    //lockedFunction.name = _name;

    const propMeta = metadata.getTypeMetadata(_func);

    if (!(propMeta instanceof property_metadata_t)) {

        return lockedFunction;
    }

    metadata.decorateFunction(lockedFunction, propMeta);    

    return lockedFunction;
}

/**
 * 
 * @param {ContextLockable} _obj 
 */
function lockActions(_obj) {

    for (const propName in _obj) {

        if (propName === 'constructor') {

            continue;
        }

        const prop = _obj[propName];

        if (typeof prop !== 'function') {

            continue;
        }

        const meta = metadata(prop);

        if (!meta[CONTEXT_LOCK]) {

            continue;
        }

        _obj[propName] = decorateLockedMethod(prop, propName);
    }
}

module.exports = {decorateLockedMethod, lockActions};