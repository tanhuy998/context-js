
class ActionResultNoContextError extends Error{


    constructor() {

        super('there is no controller context for the ActionResult to resolve the result');
    }
}

class ActionResult {

    #controllerContext;
    #hooks = [];

    get context() {

        return this.#controllerContext;
    }

    constructor() {


    }

    setContext(_controller) {

        this.#controllerContext = _controller;
    }

    cookie(..._options) {

        const callback = (function () {

            const res = this.httpContext.response;

            res.cookie(..._options);

        }).bind(this.#controllerContext);

        this.#hooks.push(callback);

        return this;
    }

    clearCookie(..._options) {

        const callback = (function () {

            const res = this.httpContext.response;

            res.clearCookie(..._options);

        }).bind(this.#controllerContext);

        return this;
    }

    resolve() {

        if (!this.context) {

            throw new IActionResultNoContextError();
        }

        for (const callback of this.#hooks || []) {

            if (typeof callback == 'function') {

                callback();
            }
        }
    }
}

module.exports = {ActionResult, ActionResultNoContextError}