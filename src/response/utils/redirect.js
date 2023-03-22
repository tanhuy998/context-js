const {ActionResult, ActionResultNoContextError} = require('../actionResult.js');
//const AsyncActionResult = require('../asyncActionResult.js');

class RedirectResultNoContextError extends ActionResultNoContextError {

    constructor() {

        super();
    }
}

class RedirectResult extends ActionResult {

    #options

    constructor(..._options) {

        super();

        this.#options = _options || [];
    }

    resolve() {

        super.resolve();

        if (this.context) {

            const res = this.context.httpContext.response;

            return res.redirect(...this.#options);
        }
        else {

            throw new RedirectResultNoContextError();
        }
    }
}

function redirect(..._options) {

    return new RedirectResult(..._options);
}

module.exports = {redirect, RedirectResult, RedirectResultNoContextError}