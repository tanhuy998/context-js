const PreInvokeFunction = require('./preInvokeFunction.js')

const DecoratorType =  {
    CLASS_DECORATOR: 0x1,
    PROPERTY_DECORATOR: 0x2,
}

class DecoratorResult {
    
    #type;
    kind;
    payload;
    _target; // this the class property or the specific class
    _context; // if target is the class's property, context is the object own the propety
    _action; // the addition thing we need to do before invoke resolving the DecoratorResult
    #_needContext;
    //decoratorArgs;


    constructor(type, targetProp, action = undefined) {

        this._target = targetProp;
        this.#type = type;
        this._action = action;

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

    resolve() {

        if (this.needContext && !this._context) throw new Error('DecoratorResult error: property decorator need context to be resolved');

        if (this.needContext) {
            
            this._action.bind(this._context);
            this._target.bind(this._context);
        }

        if (this._action instanceof PreInvokeFunction) {

            this._action.passArgs(this._target).invoke();
        }

        // the target property is acknowledged as arguments passed by default
        this._target.invoke();
    }
}

module.exports = {DecoratorResult, DecoratorType};