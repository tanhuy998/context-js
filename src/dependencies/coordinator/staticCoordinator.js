const coodinator = require("./coodinator");

/**
 * @typedef {import('../context/context')} Context
 */

module.exports = class StaticCoordinator extends coodinator {

    /**
     * 
     * @param {typeof Context} _globalContext 
     */
    static _init(_globalContext) {

        super._init(_globalContext.items);
    }
}