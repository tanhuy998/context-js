const AbstractMethodDecorator = require('./abstractMethodDecorator.js');
const PreInvokeFunctionAsync = require('../callback/preInvokeFunctionAsync.js');

module.exports = class MethodDecoratorAsync extends AbstractMethodDecorator {

    constructor(target, prop) {

        if ((typeof prop != 'funtion') && !(prop instanceof PreInvokeFunctionAsync)) {

            throw new Error('the target passed to Method Decorator is not type of function');
        }

        if (prop.constructor.name == 'AsyncFunction') {

            throw new Error('MethodDecorator does not allow async function');1
        }

        super(prop);
        //super(DecoratorType.PROPERTY_DECORATOR, prop);

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

        return result;
    }
}