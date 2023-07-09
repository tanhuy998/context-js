const AbstractMethodDecorator = require('./abstractMethodDecorator.js');
const PreInvokeFunction = require('../callback/preInvokeFunction.js');

module.exports = class MethodDecorator extends AbstractMethodDecorator {

    // #hooks;
 
     constructor(target, prop) {
 
         if ((typeof prop != 'function') && !(prop instanceof PreInvokeFunction)) {
 
             throw new Error('the target passed to Method Decorator is not type of function');
         }
 
         if (prop.constructor.name == 'AsyncFunction') {
 
             throw new Error('MethodDecorator does not allow async function');1
         }
 
         super(prop);        
 
         //this.#hooks = [];
         this.bind(target);
     }
 
    resolve() {
 
         // return super.resolve();
 
         // function handleAfterTransformedTheMethod() {
             
         //     if (this._target instanceof PreInvokeFunction) {
                 
         //         const result = this._target.invoke();
                 
         //         return result;
         //     }
         //     else {
     
         //         // const functionMeta = reflectFunction(this._target);
 
         //         // if (functionMeta.isAsync) {
 
         //         //     return await this._target.bind(this._context)();
         //         // }
         //         // else {
 
         //         //     return this._target.bind(this._context)();
         //         // }
 
         //         return this._target.bind(this._context)();
         //     }
         // }
 
        super._resolveContext();
 
        super._applyTransformation();
 
        return super._resolveTarget();
     }
 }