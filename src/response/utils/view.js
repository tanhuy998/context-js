const {ActionResult, ActionResultNoContextError} = require('../actionResult.js');

class ViewResultError extends ActionResultNoContextError {

    constructor() {

        super();
    }
}


class ViewResult extends ActionResult{

    #view
    #data

    constructor(_view, _viewData) {

        super();

        this.#view = _view;
        this.#data = _viewData;
    }

    resolve() {

        super.resolve();

        if (this.context) {

            const res = this.context.httpContext.response;

            res.render(this.#view, this.#data);
            res.end();
        }
        else {

            throw new ViewResultError();
        }
    }
}

function view(_name, viewData) {

    return new ViewResult(_name, viewData);
}

module.exports = {view, ViewResult, ViewResultError};