
const ControllerState = require('./controllerState.js');
const reflecClass = require('../libs/reflectClass.js');
const reflectFunction = require('../libs/reflectFunction.js');
const {Type} = require('../libs/type.js');
const IocContainer = require('../ioc/iocContainer.js');
const ControllerConfiguration = require('./controllerConfiguration.js');
const {ReflectionBabelDecoratorClass_Stage_3} = require('../libs/babelDecoratorClassReflection.js');
const {EventEmitter} = require('node:events');
const { BaseController } = require('../controller/baseController.js');
const HttpContext = require('../httpContext.js');
const {request, response} = require('express'); 
const ControlerState = require('./controllerState.js');

class ControllerComponentManager extends IocContainer {

    #config;


    constructor(presetVersion = undefined) {

        super();

        if (presetVersion == 'stage3') {

            this.preset({
                specialReflectionCase: [ReflectionBabelDecoratorClass_Stage_3],
            })
        }

        this.#config = new ControllerConfiguration(this);
    }

    get configuration() {

        return this.#config;
    }

    bindScope(abstract, concrete) {
        //console.log('bind Scope', abstract);
        
        this.#checkForAutoBindController(abstract);

        this.#config.bindScope(abstract, concrete);
    }

    bind(abstract, concrete, override = false) {
        //console.log('bind Transient', abstract)
        
        this.#checkForAutoBindController(abstract);

        super.bind(abstract, concrete, override);
    }

    bindSingleton(abstract, concrete, override = false) {
        //console.log('bind Singleton', abstract)
        
        this.#checkForAutoBindController(abstract);

        super.bindSingleton(abstract, concrete, override);
    }

    #checkForAutoBindController(_component) {

        if (!this.isAutoBindController(_component)) return;

        const iocContainer = this;

        function injectCoreComponentForController() {

            const controllerState = new ControlerState(iocContainer.configuration);

            this.setState(controllerState);
        }

        this.hook.add(_component, injectCoreComponentForController);
    }

    isAutoBindController(_concrete) {

        if (!(_concrete.name == 'Component')) return;

        if (!this._isParent(BaseController, _concrete)) return;
    }

    setConfig(config) {

        if (config instanceof ControllerConfiguration) {

            this.#config = config;
        }
    }

    buildController(_concrete, req, res, next) {

        if (!req && !res && !next) {

            throw new Error('can not build controller without context when Dependency Injection is enabled');
        }

        if (!this.#config) {

            throw new Error('ControllerComponentManager Error: there is no configuration to handle.');
        }

        if (!this._isParent(BaseController, _concrete)) {

            throw new TypeError('can not build the controller instance from class which is not inherits BaseController class');
        }
        
        //const controllerState = new ControllerState(this.#config);

        // load HttpContext to scope
        // controllerState.loadInstance(HttpContext, httpContext, this);

        //const instance = this.#analyzeConcrete(_concrete, controllerState);

        let instance;

        const httpContext = new HttpContext(req, res, next);

        if (this.isAutoBindController(_concrete)) {

            instance = this.get(_concrete);

            instance.state.loadInstance(HttpContext, httpContext, this);
        }
        else {

            const controllerState = new ControlerState(this.#config);

            controllerState.loadInstance(HttpContext, httpContext, this)

            instance = this.#analyzeConcrete(_concrete, controllerState);  
        }

        
        if (!instance) {

             
        }
        else {

            
        }
        //instance.setState(controllerState);

        instance.setContext(httpContext);

        return instance;
    }



    get(abstract, _controllerState) {
        
        const instance = this.#_get(abstract, _controllerState);

        return instance;
    }

    #_get(abstract, _controllerState) {

        if (!this.has(abstract)) return undefined;

        if (!_controllerState) {
            
            return super.get(abstract);
        }

        const scope = this.#config.getScope();

        if (scope.has(abstract)) {

            return this.getScopeComponent(abstract, _controllerState);
        }
        else {

            if (super.hasSingleton(abstract)) {

                return super.get(abstract);
            }
            
            const concrete = this.getConcreteOf(abstract);
            return this.#analyzeConcrete(concrete, _controllerState);
        }
    }

    getScopeComponent(abstract, _controllerState) {

        const controllerState = _controllerState;

        let component = abstract;

        if (typeof abstract == 'string') {

            component = this.getConcreteByKey(abstract);
        }

        if (component) {

            if (!controllerState.isLoaded(component)) {

                controllerState.load(component, this);
            }

            const instance = controllerState.get(component);

            return instance;
        }
        else {

            return undefined;
        }
    }

    build(concrete, _controllerState = undefined) {

        if (_controllerState) {

            if (!(_controllerState instanceof ControllerState)) {

                _controllerState = new ControllerState(this.#config);
            }

            const instance = this.#analyzeConcrete(concrete, _controllerState);

            this.#notifyNewInstance(instance, concrete); 

            return instance;
        }
        else {

            return super.build(concrete);
        }
    }

    #analyzeConcrete(concrete, _controllerState) {

        let reflection = super.getReflectionOf(concrete);
        
        if (!concrete.constructor) {

            throw new Error(`IocContainer Error: cannot build ${concrete}`)
        }
        
        if (!reflection) {

            try {
                
                reflection = reflecClass(concrete);
            }
            catch(error) {

                const specialReflectionCases = this.getPreset().specialReflectionCase;

                for (const reflector of specialReflectionCases) {

                    try {

                        reflection = new reflector(concrete);
                    }
                    catch(e) {}

                    if (reflection) break;
                }
            }
            finally {

                if (!reflection) {

                    reflection = reflectFunction(concrete);
                }
                // caching reflection of the concrete for further usage
                this.cacheReflection(concrete, reflection);

                // const args = this.#discoverParamWithScope(reflection.params, _controller);
        
                // return new concrete(...args);
            }
        }


        const args = this.#discoverParamWithScope(reflection.params, _controllerState);
        
        const instance = new concrete(...args);

        return instance;
    }

    #hasScope(abstract) {

        if (typeof abstract == 'string') {

            return this.#config.getByKey(abstract) || false;
        }

        return this.#config.getScope().has(abstract);
    }


    #discoverParamWithScope(list, _controllerState) {

        const scopeConfig = this.#config;

        //const scope = scopeConfig.getScope();
        
        const args = list.map(function(param) {

            const className = param.defaultValue;
            
            if (param.defaultValueType == Type.UNIT) {
                
                if (this.#hasScope(className)) {

                    return this.getScopeComponent(className, _controllerState);
                }
                else {

                    const component = this.getAbstractByKey(className);
                    
                    if (component) {

                        const concrete = this.getConcreteOf(component);

                        return this.get(concrete, _controllerState);
                    }
                    else {

                        return undefined;
                    }
                }
            }

        }, this);

        return args;
    }

    #notifyResolvedComponent(_instance, _abstract, _concrete) {

        this.emit('resolveComponets', _instance, _abstract, _concrete);
    }

    #notifyNewInstance(_instance, _concrete) {

        this.emit('newInstance', _instance, _concrete);
    }

    onNewInstance(_callbak) {

        this.on('newInstance', _callbak);
    }

    onResolveComponent(_callback) {

        this.on('resolveComponets', _callback);
    }
}

module.exports = ControllerComponentManager;