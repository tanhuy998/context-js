const Coordinator = require('./coodinator.js');
const {CONSTRUCTOR} = require('../constants.js');


/**
 * @typedef {import('../context/context.js')} Context
 * @typedef {import('../itemsManager.js')} ItemsManager
 */


/**
 *  Coordinate data of Context.session field, the fragment that holds the data 
 *  depends on the static 'key' field of the class.
 *  An example of SessionCoordinator is that the Express's Request and Response obj,
 *  these objects has no relationship so we could not bind them as scope components.
 *  Therefore, session coordination is the way inject these objects to the control flow.
 */
module.exports = class SessionCoordinator extends Coordinator {
    
    /**@type {Context} */
    #context;

    //#value;

    /**
     * 
     * @param {Context} _context 
     */
    [CONSTRUCTOR](_context) {

        this.#context = _context;

        this.#init();
    }
    
    get context() {

        return this.#context;
    }

    /**
     * 
     * @param {Context} _context 
     */
    constructor(_context) {

        super(...arguments);

        this.#context = _context;

        //this.#init();
    }

    #init() {
        
        this.field = this.#context.session;
        
        super._evaluate();
    }
}
