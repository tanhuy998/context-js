const {ActionResult} = require('./actionResult.js');
const {promisify} = require('node:util');


class AsyncActionResultNoHandlerError extends Error {

    constructor() {

        super('There is no async handler is setted to async action result');
    }
}

class AsyncActionResult extends ActionResult {

    #asyncHandler;

    constructor(_function) {

        super();

        this.#asyncHandler = _function;
    }

    setAsyncHandler(_function) {

        this.#asyncHandler = _function;
    }

    async resolve() {

        super.resolve();

        if (typeof this.#asyncHandler == 'function') {

            const handler = this.#asyncHandler;

            return promisify(handler);
        }
    }
}

module.exports = AsyncActionResult;