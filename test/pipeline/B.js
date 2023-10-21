const ContextHandler = require('../../src/dependenies/handler/constextHandler.js');


module.exports = class B extends ContextHandler{

    constructor(context) {

        super(...arguments);
    }

    handle() {

        console.log('phase B', this.context);
    }
}