const { decorateLockedMethod } = require("../src/dependencies/lockable/decorateLockedMethod");

function contextLock(_, context) {

    const {kind} = context;

    switch(kind) {
        case 'method':
            return handleMethod(_);
        default: 
            throw new Error('invalid use of @contextLock');
    }
}

function handleMethod(_func) {

    const decoratedMethod = decorateLockedMethod(_func);

    return decoratedMethod;
}


module.exports = contextLock;