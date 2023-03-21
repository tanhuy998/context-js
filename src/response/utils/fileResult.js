const {ActionResult, ActionResultNoContextError} = require('../actionResult.js');

class FileResultError extends ActionResultNoContextError {

    constructor() {

        super();
    }
}

class FileResult extends ActionResult {

    #options;

    constructor(..._options) {

        super();

        this.#options = _options || [''];
    }

    resolve() {

        super.resolve();

        if (this.context) {

            const res = this.context.httpContext.response;

            const callback = (function (error) {

                if (error) {

                    const res = this.httpContext.response;

                    res.status(500)
                    res.send('An error occurs when loading file');
                    res.end();
                }

            }).bind(this.context);

            res.sendFile(this.#options[0], this.#options[1] || undefined, );
        }
        else {

            throw new FileResultError();
        }
    }

}

function file(..._options) {

    return new FileResult(..._options);
}

module.exports = {file, FileResult, FileResultError}