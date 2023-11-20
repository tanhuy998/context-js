const { field } = require("../coordinator/coodinator");
const ContextLockable = require("../lockable/contextLockable");
const matchType = require("reflectype/src/libs/matchType.js");

module.exports = class ComponentCategory extends ContextLockable {

    lockActions = ['add'];

    /**@type {Map<string, Set>} */
    #categories = new Map();

    get categories() {

        return this.#categories;
    }

    constructor(_context) {

        super(_context);

        this.#init();
    }

    #init() {
    
    }

    /**
     * 
     * @param {string} _field 
     * @returns {boolean}
     */
    _check(value, _field = 'default') {
        
        const targetCategoriesSet = this.#categories.get(_field);
        
        if (!targetCategoriesSet) {
        
            return false;
        }

        if (targetCategoriesSet.has(value)) {
            /**
             *  when actualError matches an immediate value
             */
            return true;
        }
        
        return this.#lookupType(value, targetCategoriesSet);
    }

    
    /**
     * find best match error types, check on inheritance (classes and interfaces)
     * 
     * @param {Object} _value 
     * @param {Iterable<any>} _acceptanceList 
     * @returns {boolean}
     */
    #lookupType(_value, list = []) {
        
        for (const Type of list) {
            
            const matchOptionalPattern = this.#checkOptionalPattern({
                expect: Type, 
                object: _value
            });

            if (matchOptionalPattern) {
                
                return true;
            }
            
            if (typeof Type !== 'function') {
                
                continue;
            }
            
            const match = matchType(Type, _value);

            if (match) {
                
                return true;
            }
        }
        
        return false;
    }

    #checkOptionalPattern({expect, object}) {
        
        if (typeof expect === 'function') {

            return false;
        }

        return this.#likable({expect, object});
    }

    #likable({expect, object}) {
        
        if (typeof expect !== 'object' && typeof object !== 'object') {
            
            return false;
        }

        for (const propName in expect) {

            const objectProp = object[propName];

            const expectProp = expect[propName];

            if (!matchType(expectProp, objectProp)) {

                return false;
            }
        }

        return true;
    }

    add(_category, ..._types) {

        const categories = this.#categories;

        if (!categories.has(_category)) {

            categories.set(_category, new Set(_types));

            return;
        }

        for (const Type of _types) {

            categories.get(_category).add(Type);
        }
    }

    /**
     * 
     * @param {any} _value 
     * @param {string} _category 
     * 
     * @returns {boolean}
     */
    match(_value, _category) {

        return this._check(_value, _category);
    }
}