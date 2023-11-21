const {initMetadata} = require('reflectype/src/libs/propertyDecorator.js');
const traps = require('../src/dependencies/proxyTraps/autowiredMethodTraps.js');
const { placeAutoWiredMetadata, isPropMetaAutowired } = require('../src/utils/decorator/autowire.util.js');

function autowiređ(_prop, _context) {

    const {kind} = _context;

    const propMeta = initMetadata(_prop, _context);

    if (isPropMetaAutowired(propMeta)) {

        return _prop;
    }

    if (kind === 'method') {

        _prop = wrappMethod(_prop);
    }

    placeAutoWiredMetadata(propMeta);

    return _prop;
}

function wrappMethod(_func) {

    if (typeof _func !== 'function') {

        throw new Error('invalid usage of @autowired');
    }

    return new Proxy(_func, traps);
}

module.exports = autowiređ;