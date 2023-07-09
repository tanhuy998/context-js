//const RouteHandler = require('./routeHandler.js');


/**
 *  BreakPoint define mechanism for error handling at runtime
 */
module.exports = class BreakPoint {

    #node;
    #contextArgs;

    constructor(_node, _context) {

        this.#contextArgs = _context;
        this.#node = _node;
    }

    resume() {

        const resumePoint = this.#node.next;

        resumePoint.handle(...this.#contextArgs);
    }
}