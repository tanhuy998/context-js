const { property_metadata_t } = require('reflectype/src/reflection/metadata.js');
const self = require('reflectype/src/utils/self.js');
const metadata = require('../../utils/metadata.js');
const { CONTEXT_LOCK } = require('./constant.js');


/**
 * @typedef {import('./contextLockable.js')} ContextLockable
 * @typedef {import('../context/context.js')} Context
 */

/**
 * @this Lockable
 * 
 * @param {Function} _func 
 */
function decorateLockedMethod(_func) {

    const lockedFunction = function() {
        /**@type {Context} */
        const context = this.context;
        console.log(self(context).isLocked)

        const isValidContext = context !== undefined && context !== null;

        if (isValidContext && self(this).hasRegistryOf(context) && context.isLocked) {

            throw new Error();
        }

        return _func(...arguments);
    };

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

        _obj[propName] = decorateLockedMethod(prop);
    }
}

module.exports = {decorateLockedMethod, lockActions};