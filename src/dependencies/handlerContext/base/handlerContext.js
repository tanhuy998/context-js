const ApplicationState = require('../../../appState.js');

class HandlerContext {

    #iocContainer;
    #appContext;


    /**@type {Boolean} */
    #useIoc;


    get useIoc() {

        return this.useIoc;
    }

    get iocContainer() {



        return this.iocContainer;
    }

    get appState() {

        return this.#appContext.state;
    }

    constructor() {


    }

    
}

module.exports = HandlerContext;