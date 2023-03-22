const {ActionResultNoContextError} = require('../actionResult.js');
const AsyncActionResult = require('../asyncActionResult.js');

class FileResultNoContextError extends ActionResultNoContextError {

    constructor() {

        super();
    }
}

class FileResult extends AsyncActionResult {

    #options;

    constructor(..._options) {

        super();

        this.#options = _options || [''];
    }

    async resolve() {

        if (this.context) {

            const res = this.context.httpContext.response;

            const resSendFile = (res.sendFile).bind(res);


            super.setAsyncHandler(resSendFile);

            const handler = await super.resolve();

            try {

                await handler(this.#options[0], this.#options[1] || undefined);

                //res.end();
            }
            catch (error) {

                //const res = this.context.httpContext.response;

                res.status(500)
                res.send('An error occurs when loading file');
                //res.end();

                console.log(error)
            }
        }
        else {

            throw new FileResultNoContextError();
        }

        

        // return new Promise((function (resolve, reject) {

        //     if (this.context) {

        //         const res = this.context.httpContext.response;
    
        //         const callback = (function (error) {
    
        //             if (error) {
    
        //                 const res = this.httpContext.response;
    
        //                 res.status(500)
        //                 res.send('An error occurs when loading file');    
    
        //                 console.log(error)
        //             }
    
        //             res.end();
    
        //             resolve();
    
        //         }).bind(this.context);
    
        //         res.sendFile(this.#options[0], this.#options[1] || undefined, callback);
        //     }
        //     else {
    
        //         reject(new FileResultError());
        //     }

        // }).bind(this))
    }

}

function file(..._options) {

    return new FileResult(..._options);
}

module.exports = {file, FileResult, FileResultNoContextError}