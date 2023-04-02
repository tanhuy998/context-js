//const {BaseController} = require('../controller/baseController.js');
const IocContainer = require('./iocContainer.js');
const {preprocessDescriptor} = require('../decorator/utils.js');
const ControllerComponentManager = require('../controller/controllerComponentManager.js');
const reflectClass = require('../libs/reflectClass.js');
const {EventEmitter} = require('node:events');
const { Console } = require('node:console');

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

class IocContainerBindScopeInterfaceError extends Error {

    constructor() {

        super('The IocContainer does not have bindScope() Method');
    }
}

class Hook extends EventEmitter{

    #topics = new WeakMap();

    constructor() {

        super();
    }

    add(_topic, ..._callback) {

        if (!this.#topics.has(_topic)) {

            this.#topics.set(_topic, []);
        }

        this.#topics.get(_topic).push(..._callback);
    }

    notify(_topic, _instance) {

        const hooks = this.#topics[_topic] || [];

        for (const callback of hooks) {

            if (typeof callback == 'function') {

                callback.bind(_instance)();
            }
        }
    }
}

class BindingContext {

    static #currentIocContainer;
    static #isFixedContext = false;

    static #Component = {};
    static #componentMap = new WeakMap();

    static #bindingHooks = [];
    static #currentComponent;

    static #hooks = new Hook();

    static getBindingHooks() {

        return this.#bindingHooks;
    }

    static get hooks() {

        return this.#hooks;
    }

    static addHook(...hooks) {

        if (!this.#currentComponent) {

            throw new Error('Dependency injection error: You must @autoBind the class before use @is to inject properties');
        }

        hooks.forEach((_callback) => {

            if (typeof _callback != 'function') {

                throw new Error('passing argument that is not type of function to BindingContext.addHook() is not be allowed')
            }

            if (_callback.constructor.name == 'AsyncFunction') {

                throw new Error('BindingContext.addHook() does not accept async function');
            }
        })

        if (!this.#bindingHooks) {

            this.#bindingHooks = [];
        }

        this.#bindingHooks.push(...hooks);
    }

    static bindComponent(symbol) {

        this.#Component[symbol] = 1;

        //this.#bindingHooks = [];

        this.#currentComponent = symbol;
    }

    static get currentComponent() {

        return this.#currentComponent;
    }

    static assignComponent(symbol, concrete) {

        if (!this.#Component[symbol]) return;

        this.#Component[symbol] = concrete;

        this.#componentMap.set(concrete, 1);

        //this.#hooks.add()
    }

    static getBindComponentBySymbol(symbol) {

        return this.#Component[symbol];
    }

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

        // const currentComponentSymbol = this.currentComponent;

        // const component = this.#Component[currentComponentSymbol];

        // const currentIocContainer = this.#currentIocContainer;

        // const hooks = currentIocContainer.hooks;

        // if (hooks && this.#bindingHooks) {

        //     hooks.add(component, ...this.#bindingHooks);
        // }

        this.#currentComponent = undefined;
        this.#bindingHooks = undefined;

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

function autoBind(_type = BindType.TRANSIENT, _resolvePropertyWhenIntantiate = true, _iocContainer) {

    if (BindingContext.currentComponent) {

        throw new Error('applying @autoBind multiple times is not allowed');
    }

    if (!BindingContext.isFixedContext) {

        if (_iocContainer instanceof IocContainer) {

            BindingContext.switchContext(_iocContainer);
        }
    }
    else {

        _iocContainer = BindingContext.currentContext();
    }

    const symbol = Symbol(Date.now);

    BindingContext.bindComponent(symbol);

    return function(_constructor) {

        try {

            const bindingHooks = BindingContext.getBindingHooks() || [];

            const Component = class extends _constructor {

                #hookedComponents = [];
                #constructorParams;
                
                get constructorParams() {

                    return this.#constructorParams;
                }

                get isDecoratedComponent() {

                    return true;
                }

                constructor() {

                    super();

                    const componentHooks = bindingHooks;

                    console.log(componentHooks);

                    for (const callback of componentHooks) {

                        callback.bind(this)();
                    }

                    if (_resolvePropertyWhenIntantiate) {

                        this.resolveProperty();
                    }
                }


                pushDecoratedProp(decoratedResult) {
        
                    this.#hookedComponents.push(decoratedResult);
                }

                async resolveProperty() {

                    if (super.resolveProperty) {

                        await super.resolveProperty();
                    }

                    if (!this.#hookedComponents) return;
                    
                    for (const propertyDecorator of this.#hookedComponents) {

                        if (propertyDecorator instanceof PropertyDecorator) {
            
                            await propertyDecorator.bind(this).resolve();
                        }
                    }

                    this.#hookedComponents = undefined;
                }
            }

            switch(_type) {

                case BindType.TRANSIENT:
                    _iocContainer.bind(Component, Component);
                    break;
                case BindType.SCOPE:
                    _iocContainer.bindScope(Component, Component);
                    break;
                case BindType.SINGLETON:
                    _iocContainer.bindSingleton(Component, Component);
                    break;
            } 

            BindingContext.assignComponent(symbol, Component);

            // if (_iocContainer instanceof ControllerComponentManager) {

            //     const componentHooks = BindingContext.getBindingHooks();

            //     if (Array.isArray(componentHooks)) {
                    
            //         _iocContainer.hooks.add(Component, ...componentHooks);
            //     }
            // }

            BindingContext.endContext();

            return Component;
        }
        catch(error) {
            
            if (error instanceof TypeError && error.message.match(/bindScope is not a function/) != null) {

                //throw new Error('autoBind Error: the passed ioc container does not have bindScope() method');
                throw new IocContainerBindScopeInterfaceError()
            }
            else {

                throw error;
            }   
        }    
    }
}

function injectComponent(_target, _component, _iocContainer, _setter) {

    const state = this.state || undefined;

    const {propName} = _target;
    
    const componentInstance = _iocContainer.get(_component, state);

    if (componentInstance) {

        if (_setter) {

            console.log('is private', _setter)
            return _setter(componentInstance);
        }
        
        this[propName] = componentInstance;

        return;
    }
    else {

        const componetName = (typeof _component == 'string') ? _component : componentInstance.name;

        throw new Error(`Binding Error: cannot find ${componetName}`)
    }
}

function is(component) {

    const iocContainer = BindingContext.currentContext();

    const currentComponentSymbol = BindingContext.currentComponent;

    if (!iocContainer) {

        throw new Error('Property Binding Error: your class is not bind with an ioc container'); 
    }

    if (!currentComponentSymbol) {

        throw new Error('Dependency injection error: You must @autoBind the class before use @is to inject properties');
    }

    return function(target, prop, descriptor) {

        const iocContainer = BindingContext.currentContext();

        //descriptor.initializer = () => iocContainer.get(component)

        //const setter = (!target && descriptor.set) ? descriptor.set : undefined

        const decoratorResult = preprocessDescriptor(target, prop, descriptor);

        const payload = [component, iocContainer];

        //console.log(descriptor)

        if (target.isPseudo && descriptor.private) {

            console.log('private');

            //const currentComponentSymbol = BindingContext.currentComponent;

            payload.push(descriptor.set);
        }

        decoratorResult.payload['injectProperty'] = payload;

        decoratorResult.transform(injectComponent, 'injectProperty');

        descriptor.initializer = () => decoratorResult;

        BindingContext.addHook(function () {

            console.log('push private decorator property')
            
            decoratorResult.bind(this).resolve();
        });

        console.log(BindingContext.getBindingHooks())

        return descriptor;
    }
}

module.exports = {autoBind, BindType, is, BindingContext};