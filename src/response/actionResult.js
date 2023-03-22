const IActionResult = require('./iActionResult.js');

class ActionResultNoContextError extends Error{


    constructor() {

        super('there is no controller context for the ActionResult to resolve the result');
    }
}
class ActionResult extends IActionResult {

    #controllerContext;
    #hooks = [];

    constructor() {

        super();
    }

    get context() {

        return this.#controllerContext;
    }

    setContext(_controller) {

        this.#controllerContext = _controller;
    }

    cookie(..._options) {

        const callback = (function () {

            const res = this.httpContext.response;

            res.cookie(..._options);

        });

        this.#hooks.push(callback);

        return this;
    }

    clearCookie(..._options) {

        const callback = (function () {

            const res = this.httpContext.response;

            res.clearCookie(..._options);

        })
        this.#hooks.push(callback)

        return this;
    }

    status(_code) {

        const callback = (function () {

            const res = this.httpContext.response;

            res.status(_code);

        });

        this.#hooks.push(callback);

        return this;
    }

    header(_headerSet) {

        const callback = (function () {

            const res = this.httpContext.response;

            res.header(_headerSet);

        });

        this.#hooks.push(callback);

        return this;
    }

    resolve() {

        if (!this.context) {

            throw new ActionResultNoContextError();
        }

        for (const callback of this.#hooks || []) {

            if (typeof callback == 'function') {

                callback.bind(this.#controllerContext)();
            }
        }
    }
}

module.exports = {ActionResult, ActionResultNoContextError};