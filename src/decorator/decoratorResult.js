const PreInvokeFunction = require('../callback/preInvokeFunction.js');
const PreInvokeFunctionAsync = require('../callback/preInvokeFunctionAsync.js');
const {EventEmitter} = require('node:events');
//const reflectFunction = require('../libs/reflectFunction.js')

const DecoratorType =  {
    CLASS_DECORATOR: 0x1,
    PROPERTY_DECORATOR: 0x2,
}
class DecoratorResult extends EventEmitter{
    
    #type;
    kind;
    payload;
    _target; // this the class property or the specific class
    _context; // if target is the class's property, context is the object own the propety
    _actionQueue; // the addition thing we need to do before invoke resolving the DecoratorResult
    #_needContext;
    _targetDescriptor;
    //decoratorArgs;


    constructor(type, targetProp, action = undefined) {

        super();

        this._target = targetProp;
        this.#type = type;
        this._actionQueue = [];
        this.payload = {};

        this.#Init();    
    } 

    get needContext() {

        return this.#_needContext;
    }

    get type() {

        return this.#type;
    }

    #Init() {

        if (this.#type == DecoratorType.PROPERTY_DECORATOR) this.#_needContext = true;
        else this.#_needContext = false;

        this.#InitEvents();
    }

    #InitEvents() {
        this.on('beforeResolve', (context, _theTarget, descriptor, type) => {});
        this.on('afterResolve', (returnValue, context, _theTarget, descriptor, type) => {});
    }

    payload(...args) {

        for (const arg of args) {

            for (const prop in arg) {

                this.payload[prop] = arg[prop];
            }
        }

        //this.payload = args;
    }

    bind(object) {

        this._context = object;

        return this;
    }

    transform(_action, decoratorName) {

        this._actionQueue.push({
            action: _action,
            decoratorName: decoratorName
        });
    }

    _applyTransformation() {

        for (const meta of this._actionQueue) {

            let {action, decoratorName} = meta;

            const payload = this.payload[decoratorName];

            //const args = (payload.constructor.name == 'Array') ;
            const args = (Array.isArray(payload)) ? payload : (payload) ? [payload] : [];

            if (this.needContext) {

                action = action.bind(this._context);
            }

            if (action instanceof PreInvokeFunction) {

                //action.passArgs(this._target, ...this.payload[decoratorName]).invoke();
                action.passArgs(this._target, ...args).invoke();
            }
            else {
            
                action(this._target, ...args);    
            }
        }
    }

    _resolveContext() {

        if (this.needContext && !this._context) throw new Error('DecoratorResult error: property decorator need context to be resolved');

        this.emit('beforeResolve', this._context, this._target, this._targetDescriptor, this.type);

        if (this.needContext) {

            const isFunction = (this._target.constructor.name == 'Function');
            const isPreInvoke = (this._target instanceof PreInvokeFunction);

            if (isFunction || isPreInvoke) {
                
                this._target.bind(this._context);
            }
        }
    }

    _resolveTarget() {

        let result;

        if (this._target instanceof PreInvokeFunction) {

            result = this._target.invoke();
        }
        else {

            result = this._target.bind(this._context)();
        }

        this.emit('afterResolve', result, this._context, this._target, this._targetDescriptor, this.type);
    }
    
    resolve() {

        this._resolveContext();

        this._applyTransformation();

        this._resolveTarget();
        
        // let result;
        
        // if (_afterTransform) {

        //     // if (_afterTransform instanceof PreInvokeFunction) {
        //     //     //_afterTransform.passArgs(this._target);

        //     //     result = _afterTransform.bind(this).invoke();

        //     // }
        //     // else if (typeof _afterTransform == 'function') {

        //     //     // if (_afterTransform.constructor.name == 'AsyncFunction') {

        //     //     //     result = await _afterTransform.bind(this)(this._target);
        //     //     // }
        //     //     // else {

        //     //     //     result = _afterTransform.bind(this)(this._target);
        //     //     // }

        //     //     result = _afterTransform.bind(this)(this._target);
        //     // }

        //     result = this.#invokeAfterTransform(_afterTransform);

        //     if (isPromise(result)) {

        //         return result.then((function(_result) {

        //             this.emit('afterResolve', _result, this._context, this._target, this._targetDescriptor, this.type);

        //         }).bind(this));
        //     }
        // }  
       
        //this.emit('afterResolve', this._target, this._context, this._targetDescriptor, this.type);
        // if this._target is not instance of PreInvokeFunction 
        // it's mean the target of the decoratorResult is an class property
    }

    #invokeAfterTransform(_afterTransform) {

        if (_afterTransform instanceof PreInvokeFunction) {
            //_afterTransform.passArgs(this._target);

            return _afterTransform.bind(this).invoke();

        }
        else if (typeof _afterTransform == 'function') {

            // if (_afterTransform.constructor.name == 'AsyncFunction') {

            //     result = await _afterTransform.bind(this)(this._target);
            // }
            // else {

            //     result = _afterTransform.bind(this)(this._target);
            // }

            return _afterTransform.bind(this)(this._target);
        }
    }
}

class PropertyDecorator extends DecoratorResult {


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

class MethodDecorator extends DecoratorResult {

   // #hooks;

    constructor(target, prop) {

        if ((typeof prop != 'function') && !(prop instanceof PreInvokeFunction)) {

            throw new Error('the target passed to Method Decorator is not type of function');
        }

        if (prop.constructor.name == 'AsyncFunction') {

            throw new Error('MethodDecorator does not allow async function');1
        }

        super(DecoratorType.PROPERTY_DECORATOR, prop);

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

        super._resolveTarget();
    }
}

class MethodDecoratorAsync extends DecoratorResult {

    constructor(target, prop) {

        if ((typeof prop != 'funtion') && !(prop instanceof PreInvokeFunctionAsync)) {

            throw new Error('the target passed to Method Decorator is not type of function');
        }

        if (prop.constructor.name == 'AsyncFunction') {

            throw new Error('MethodDecorator does not allow async function');1
        }

        super(DecoratorType.PROPERTY_DECORATOR, prop);

        //this.#hooks = [];
        this.bind(target);
    }

    async resolve() {

        super._resolveContext();

        super._applyTransformation();

        let result;

        if (this._target instanceof PreInvokeFunctionAsync) {

            result = await this._target.invoke();
        }
        else {

            result = await this._target.bind(this._context)();
        }

        this.emit('afterResolve', result, this._context, this._target, this._targetDescriptor, this.type);
    }
}

class ClassDecorator extends DecoratorResult {

    constructor(targetCLass) {

        super(DecoratorType.CLASS_DECORATOR, targetCLass);
    }
}


module.exports = {DecoratorResult, DecoratorType, MethodDecorator, PropertyDecorator, ClassDecorator, MethodDecoratorAsync};