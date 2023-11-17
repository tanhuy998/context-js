const ComponentCategory = require("../category/componentCategory");
const ConventionError = require("../errors/conventionError");
const { EXCEPTION } = require("./constant");

/**
 * ContextExceptionErrorCategory declares exception category for error handling systems that the base Context class refuses to handle.
 */
module.exports = class ContextExceptionErrorCategory extends ComponentCategory {

    constructor(_context) {

        super(_context);

        this.#init();
    }

    #init() {

        this.add(EXCEPTION, ConventionError);
    }
}