const DecoratorResult = require('./decoratorResult');

module.exports = class PropertyDecorator extends DecoratorResult {


    constructor(target, propName) {

        const obj = {
            target, propName
        }

        super(DecoratorType.PROPERTY_DECORATOR, obj);
    }

    resolve() {
        
        // if (this.needContext && !this._context) throw new Error('PropertyDecorator error: property decorator need context to be resolved');
        
        // for (const meta of this._actionQueue) {

        //     let {action, decoratorName} = meta;
            
        //     if (this.needContext) {

        //         action = action.bind(this._context);
        //     }

        //     //const {target, propName} = super._target;
 
        //     if (action instanceof PreInvokeFunction) {
                
        //         return await action.passArgs(this._target, ...this.payload[decoratorName]).invoke();
        //     }
        //     else {

        //         const functionMeta = reflectFunction(action);

        //         if (functionMeta.isAsync) {

        //             return await action(this._target, ...this.payload[decoratorName])
        //         }
        //         else {

        //             return action(this._target, ...this.payload[decoratorName]);
        //         }   
        //     }
        // }

        //return super.resolve();

        super._resolveContext();

        super._applyTransformation();

        this.emit('afterResolve', undefined, this._context, this._target, this._targetDescriptor, this.type);
    }
}