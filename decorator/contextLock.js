const { decorateLockedMethod, lockActions } = require("../src/dependencies/lockable/decorateLockedMethod");

function contextLock(_, context) {

    const {kind} = context;

    switch(kind) {
        case 'method':
            return handleMethod(_);
        case 'class':
            return handleClass(_);
        default: 
            throw new Error('invalid use of @contextLock');
    }
}

function handleMethod(_func) {

    const decoratedMethod = decorateLockedMethod(_func);

    return decoratedMethod;
}

function handleClass(_class) {

    const registry = _class.contextRegistry

    _class.contextRegistry = registry instanceof Set ? registry : new Set();

    _class.lockOn = function(_ctx) {

        this.contextRegistry.add(_ctx);
    }

    const prototype = _class.prototype;

    lockActions(prototype);

    return _class;
}


module.exports = contextLock;