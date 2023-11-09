const {initMetadata} = require('reflectype/src/libs/propertyDecorator.js');
const {getTypeMetadata} = require('../src/utils/metadata.js');
const initFootPrint = require('reflectype/src/libs/initFootPrint.js');
const traps = require('../src/dependencies/proxyTraps/autowiredMethodTraps.js');

function autowiređ(_prop, _context) {

    const {kind} = _context;

    const propMeta = initMetadata(_prop, _context);

    if (isApplied(propMeta)) {

        return _prop;
    }

    if (kind === 'method') {

        _prop = wrappMethod(_prop);
    }

    initFootPrint(propMeta);
    
    propMeta.footPrint.needInject = true;

    return _prop;
}

function wrappMethod(_func) {

    if (typeof _func !== 'function') {

        throw new Error('invalid usage of @autowired');
    }

    return new Proxy(_func, traps);
}

// function handleAccessor(_func, _concrete) {


// }

function isApplied(propMeta) {

    return propMeta.footPrint?.needInject === true;
}

module.exports = autowiređ;