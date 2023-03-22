const {ActionResultNoContextError} = require('../actionResult.js');
const AsyncActionResult = require('../asyncActionResult.js');

class DownloadResultNoContextError extends ActionResultNoContextError {

    constructor() {

        super();
    }
}

class DownloadResult extends AsyncActionResult {

    #options;

    constructor(..._options) {

        super();

        this.#options = _options || [''];
    }

    async resolve() {

        //res.download(this.#options[0], this.#options[1] || undefined, );

        if (this.context) {

            const res = this.context.httpContext.response;

            const resDownload = (res.download).bind(res);

            super.setAsyncHandler(resDownload);

            const download = await super.resolve();

            try {

                await download(this.#options[0], this.#options[1] || undefined);
            }
            catch (error) {

                res.status(500)
                res.send('An error occurs when loading file');
                //res.end();

                console.log(error)
            }
        }
        else {

            throw new DownloadResultNoContextError();
        }
    }
}

function download(..._options) {

    return new DownloadResult(..._options);
}

module.exports = {download, DownloadResult, DownloadResultNoContextError}