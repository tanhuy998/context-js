const Handler = require('../handler/handler.js');

class ContextualController extends Handler{

    static serve(_context) {

        return function() {

            return new this(_context).handle();
        }
    }

    constructor(_context) {
        
        super(...arguments);
    }
}

module.exports = ContextualController;