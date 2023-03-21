const {ActionResult, ActionResultNoContextError} = require('../actionResult.js');

class DownloadResultError extends ActionResultNoContextError {

    constructor() {

        super();
    }
}

class DownloadResult extends ActionResult {

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

            res.download(this.#options[0], this.#options[1] || undefined, );
        }
        else {

            throw new DownloadResultError();
        }
    }
}

function download(..._options) {

    return new DownloadResult(..._options);
}

module.exports = {download, DownloadResult, DownloadResultError}