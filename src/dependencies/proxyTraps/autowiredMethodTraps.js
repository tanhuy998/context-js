/**
 * @typedef {import('../context/context.js')} Context
 */

module.exports = {
    /**
     * 
     * @param {Function} target 
     * @param {Object} _this 
     * @param {Iterable} args 
     * @returns 
     */
    apply: function(target, _this, args) {

        /**@type {Context?} */
        const context = _this.context;
        const DI = context?.global?.DI;
        
        if (args.length > 0 || typeof DI?.invoke !== 'function') {
            
            return target.call(_this, ...args);
        }
        
        return DI.invoke(_this, target, context);
    }
}