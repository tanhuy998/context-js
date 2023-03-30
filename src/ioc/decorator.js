//const {BaseController} = require('../controller/baseController.js');
const IocContainer = require('./iocContainer.js');
const {preprocessDescriptor} = require('../decorator/utils.js');


class BindType {

    static get SINGLETON() {

        return 'singleton';
    }
    
    static get SCOPE() {

        return 'scope';
    }

    static get TRANSIENT() {

        return 'transient';
    }
}

class BindingContext {

    static #currentIocContainer;
    static #isFixedContext = false;

    static get isFixedContext() {

        return this.#isFixedContext;
    }

    static fixedContext(_iocContainer) {

        this.#checkFixedContext();

        this.switchContext(_iocContainer);

        this.#isFixedContext = true;
    }

    static #checkFixedContext() {

        if (this.#isFixedContext) {

            throw new Error('Binding Error: the context of autoBind decorator is fixed, so you cannot not switch to another context');
        }
    }

    static switchContext(_iocContainer) {

        this.#checkFixedContext();

        if (!(_iocContainer instanceof IocContainer)) {

            throw new Error('autoBind Error: invalid ioc container');
        }

        this.#currentIocContainer = _iocContainer;
    }

    static endContext() {

        if (this.#isFixedContext) return;

        this.#currentIocContainer = undefined;
    }

    static currentContext() {

        const context = this.#currentIocContainer;

        if (!context) {

            throw new Error('Binding Context Error: your class is not bound or you are not in FixedContext.')
        }

        return context
    }
}

function autoBind(_type = BindType.TRANSIENT, _iocContainer) {

    if (!BindingContext.isFixedContext) {

        BindingContext.switchContext(_iocContainer);

    }else {

        _iocContainer = BindingContext.currentContext();
    }

    return function(_constructor) {

        try {

            switch(_type) {

                case BindType.TRANSIENT:
                    _iocContainer.bind(_constructor, _constructor);
                    return;
                case BindType.SCOPE:
                    _iocContainer.bindScope(_constructor, _constructor);
                    return;
                case BindType.SINGLETON:
                    _iocContainer.bindSingleton(_constructor, _constructor);
                    return;
            } 
        }
        catch(error) {

            throw new Error('autoBind Error: the passed ioc container does not have bindScope() method');
        }
        finally {

            BindingContext.endContext();
        }
    }
}

function injectComponent(_target, _component, _iocContainer) {

    const state = this.state || undefined;

    const {propName} = _target;

    const component = _iocContainer.get(_component, state);

    if (component) {

        this[propName] = component;
    }
    else {

        const componetName = (typeof _component == 'string') ? _component : component.name;

        throw new Error(`Binding Error: cannot find ${componetName}`)
    }
}

function is(component) {

    const iocContainer = BindingContext.currentContext();

    if (!iocContainer) {

        throw new Error('Property Binding Error: your class is not bind with an ioc container'); 
    }

    return function(className, prop, descriptor) {

        const decoratorResult = preprocessDescriptor(className, prop, descriptor);

        decoratorResult.payload['injectProperty'] = [component, iocContainer];
        decoratorResult.transform(injectComponent, 'injectProperty');

        descriptor.initializer = () => decoratorResult;

        return descriptor;
    }
}

module.exports = {autoBind, BindType, is, BindingContext};