const Interface = require('reflectype/src/interface/interface.js');
const {IS_CHECKABLE} = require('reflectype/src/constants.js');
const isAbstract = require('reflectype/src/utils/isAbstract.js');

function checkType(abstract, concrete) {

    // const concreteType = (typeof concrete);
    // const abstractType = (typeof abstract);

    if (concrete.prototype instanceof Interface) {

        throw new TypeError(`cannot bind concrete class [${concrete?.name}] that is subclass of [Interface]`);
    }

    if (abstract.prototype instanceof Interface) {

        if (!concrete[IS_CHECKABLE] || !concrete.__implemented(abstract)) {
            
            throw new TypeError(`class [${concrete?.name}] hasn't implemented [${abstract.name}] yet`);
        }

        return;
    }

    if (!abstract.constructor && !concrete.constructor) {

        throw new Error('IocContainer Error: abstract and concrete must have contructor')
    }

    if (!isParent(abstract, concrete)) {

        throw new Error('IocContainer Error: ' + concrete.constructor.name + ' did not inherit ' + abstract.constructor.name);
    }
}


function hasRelationShip(lhs, rhs) {

    try {

        checkType(lhs, rhs);

        return true;
    }
    catch {}

    try {

        checkType(rhs, lhs);

        return true;
    }
    catch {

        return false;
    }
}

/**
 * 
 * @param {Object} base 
 * @param {Object} derived 
 * @returns 
 */
function isParent(base, derived) {

    if (derived == base) return true;

    let prototype = derived.__proto__;

    while(prototype !== null) {
        
        if (prototype === base) {

            return true;
        }

        prototype = prototype.__proto__;
    } 
}

function useTrait(_class, _trait) {

    if (typeof _class !== 'function') {

        return;
    }

    for (const name in _trait || {}) {

        if (name === 'constructor') {

            continue;
        }

        _class.prototype[name] = _trait[name];
    }
}

module.exports = {isParent, hasRelationShip, checkType, isAbstract, useTrait};