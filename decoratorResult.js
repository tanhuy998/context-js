const PreInvokeFunction = require('./preInvokeFunction.js')

const DecoratorType =  {
    CLASS_DECORATOR: 0x1,
    PROPERTY_DECORATOR: 0x2,
}

class PropertyDecorator extends DecoratorResult {


    constructor(target, propName) {

        const obj = {
            target, propName
        }

        super(DecoratorType.PROPERTY_DECORATOR, obj);
    }

    resolve() {

        if (super.needContext && !super._context) throw new Error('PropertyDecorator error: property decorator need context to be resolved');

        for (const meta of super._actionQueue) {

            let {action, decoratorName} = meta;
            
            if (super.needContext) {

                action = action.bind(super._context);
            }

            const {target, propName} = super._target;
 
            if (action instanceof PreInvokeFunction) {

                action.passArgs(super._target, ...this.payload[decoratorName]).invoke();
            }
            else {

                action(this._target, ...this.payload[decoratorName]);
            }
        }
    }
}

class MethodDecorator extends DecoratorResult {

    #hooks;

    constructor(target, Prop) {

        super(DecoratorType.PROPERTY_DECORATOR, Prop);

        this.#hooks = [];
        this.bind(target);
    }

    resolve() {

        const resolved_value = super.resolve();

        for (const hook of this.#hooks) {

            const {callback, args} = hook;

            callback(resolved_value, ...args);
        }
    }

    whenFulfill(_callback,..._args) {

        this.#hooks.push({
            callback: _callback,
            args: _args,
        });
    }
}

class ClassDecorator extends DecoratorResult {

    constructor(targetCLass) {

        super(DecoratorType.CLASS_DECORATOR, targetCLass);
    }
}
class DecoratorResult {
    
    #type;
    kind;
    payload;
    _target; // this the class property or the specific class
    _context; // if target is the class's property, context is the object own the propety
    _actionQueue; // the addition thing we need to do before invoke resolving the DecoratorResult
    #_needContext;
    //decoratorArgs;


    constructor(type, targetProp, action = undefined) {

        this._target = targetProp;
        this.#type = type;
        this._actionQueue = [];
        this.payload = {};

        this.#Init();    
    } 

    get needContext() {

        return this.#_needContext;
    }

    #Init() {

        if (this.#type == DecoratorType.PROPERTY_DECORATOR) this.#_needContext = true;
        else this.#_needContext = false;
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

    resolve() {

        
        if (this.needContext && !this._context) throw new Error('DecoratorResult error: property decorator need context to be resolved');

        if (this.needContext) {
            
            this._target.bind(this._context);
        }

        for (const meta of this._actionQueue) {

            let {action, decoratorName} = meta;
            
            if (this.needContext) {

                action = action.bind(this._context);
            }

            if (action instanceof PreInvokeFunction) {

                action.passArgs(this._target, ...this.payload[decoratorName]).invoke();
            }
            else {

                action(this._target, ...this.payload[decoratorName]);
            }
        }


        if (this._target instanceof PreInvokeFunction) {

            return this._target.invoke();
        }
        
        // if this._target is not instance of PreInvokeFunction 
        // it's mean the target of the decoratorResult is an class property
    }
}

module.exports = {DecoratorResult, DecoratorType, MethodDecorator, PropertyDecorator, ClassDecorator};