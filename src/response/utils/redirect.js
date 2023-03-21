const {ActionResult, ActionResultNoContextError} = require('../actionResult')

class RedirectResultError extends ActionResultNoContextError {

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

            res.redirect(...this.#options);
        }
        else {

            throw new RedirectResultError();
        }
    }
}

function redirect(..._options) {

    return new RedirectResult(..._options);
}

module.exports = {redirect, RedirectResult, RedirectResultError}