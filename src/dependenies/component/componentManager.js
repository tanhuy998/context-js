const IocContainer = require('../ioc/iocContainer.js');
const Scope = require('./scope.js');
const {Type} = require('../../libs/type.js');
const ComponentConfigurator = require('./componentConfigurator.js');

const {ReflectionBabelDecoratorClass_Stage_3} = require('../libs/babelDecoratorClassReflection.js');
const {EventEmitter} = require('node:events');
const { BaseController } = require('../controller/baseController.js');
const HttpContext = require('../httpContext.js');
const reflectFunction = require('../libs/reflectFunction.js');
const reflectClass = require('../libs/reflectClass.js');
const InvalidClassReflectionError = require('../libs/invalidClassReflectionError.js');
//const Scope = require('./scope.js');

class ComponentManager extends IocContainer {

    /**
     *  @type {ComponentConfigurator}
     */
    #config;

    /**
     * 
     * @param {string | undefined} presetVersion 
     */
    constructor(presetVersion = undefined) {

        super();

        if (presetVersion == 'stage3') {

            this.preset({
                specialReflectionCase: [ReflectionBabelDecoratorClass_Stage_3],
            })
        }

        this.#config = new ComponentConfigurator(this);
    }

    /**
     *  @returns {ComponentConfigurator}
     */
    get configuration() {

        return this.#config;
    }

    /**
     * 
     * @param {Object} abstract 
     * @param {Object} concrete 
     */
    bindScope(abstract, concrete) {
        
        this.#checkForAutoBindController(abstract);

        this.#config.bindScope(abstract, concrete);
    }

    /**
     * @override
     * @param {Object} abstract 
     * @param {Object} concrete 
     * @param {boolean} override 
     */
    bind(abstract, concrete, override = false) {
        
        this.#checkForAutoBindController(abstract);

        super.bind(abstract, concrete, override);
    }

     /**
     * @override
     * @param {Object} abstract 
     * @param {Object} concrete 
     * @param {boolean} override 
     */
    bindSingleton(abstract, concrete, override = false) {
        
        this.#checkForAutoBindController(abstract);

        super.bindSingleton(abstract, concrete, override);
    }

    #checkForAutoBindController(_component) {
        
        if (!this.isAutoBindController(_component)) return;
 
        const iocContainer = this;

        function injectCoreComponentForController() {

            const scope = new Scope(iocContainer.configuration);

            this.setState(scope);
        }

        this.hook.add(_component, injectCoreComponentForController);
    }

    /**
     * 
     * @param {Object} _concrete 
     * @returns {boolean}
     */
    isAutoBindController(_concrete) {
        
        if (!(_concrete.name == 'Component')) return;
        
        return this._isParent(BaseController, _concrete);
    }

    /**
     * 
     * @param {ComponentConfigurator} config 
     */
    setConfig(config) {

        if (config instanceof ComponentConfigurator) {

            this.#config = config;
        }
    }

    /**
     *
     */

    /**
     * @template T
     * 
     * @param {T} _concrete 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns {T}
     * 
     * @throws {Error | TypeError}
     */
    buildController(_concrete, req, res, next) {

        if (!req && !res && !next) {

            throw new Error('can not build controller without context when Dependency Injection is enabled');
        }

        if (!this.#config) {

            throw new Error('ComponentManager Error: there is no configuration to handle.');
        }

        if (!this._isParent(BaseController, _concrete)) {

            throw new TypeError('can not build the controller instance from class which is not inherits BaseController class');
        }

        let instance;

        const httpContext = new HttpContext(req, res, next);

        if (this.isAutoBindController(_concrete)) {

            instance = this.get(_concrete);

            instance.state.loadInstance(HttpContext, httpContext, this);
        }
        else {

            const scope = new ControlerState(this.#config);

            scope.loadInstance(HttpContext, httpContext, this)

            instance = this.#analyzeConcrete(_concrete, scope);  
        }

        instance.setContext(httpContext);

        return instance;
    }


    /**
     * @override
     * @param {Object} abstract 
     * @param {Scope} _scope 
     * @returns {Object | undefined}
     */
    get(abstract, _scope) {
        
        const instance = this.#_get(abstract, _scope);

        return instance;
    }

    /**
     * 
     * @param {Object} abstract 
     * @param {Scope} _scope 
     * @returns {Object | undefined}
     */
    #_get(abstract, _scope) {

        if (!_scope) {
            
            return super.get(abstract);
        }

        //const scope = this.#config.getScope();
        const scope = _scope instanceof Scope ? _scope : this.#config.getScope();
        
        if (scope.has(abstract)) {
            
            return this.getScopeComponent(abstract, _scope);
        }
        
        if (!this.has(abstract)) return undefined;

        if (super.hasSingleton(abstract)) {

            return super.get(abstract);
        }

        const concrete = this.getConcreteOf(abstract);
        return this.#analyzeConcrete(concrete, _scope);
    }

    /**
     * 
     * @param {Object} abstract 
     * @param {Scope} _scope 
     * @returns {Object | undefined}
     */
    getScopeComponent(abstract, _scope) {

        const scope = _scope;

        let component = abstract;

        if (typeof abstract == 'string') {

            component = this.getConcreteByKey(abstract);
        }
        
        if (component) {

            if (!scope.isLoaded(component)) {

                scope.load(component, this);
            }

            const instance = scope.get(component);
            
            return instance;
        }
        else {

            return undefined;
        }
    }

    /**
     * 
     * @param {Object} abstract 
     * @param {Scope | undefined} _scope 
     *  
     * @returns {Object | undefined}
     */
    build(concrete, _scope = undefined) {

        if (_scope) {

            if (!(_scope instanceof Scope)) {

                _scope = new Scope(this.#config);
            }

            const instance = this.#analyzeConcrete(concrete, _scope);

            this.#notifyNewInstance(instance, concrete); 

            return instance;
        }
        else {

            return super.build(concrete);
        }
    }

    #reflectAsFunction(_target) {

        try {

            // to check if the _target is class
            const reflectionClass = reflectClass(_target);

            this.cacheReflection(reflectionClass);

            return reflectionClass;
        }
        catch(e) {

            if (!(e instanceof InvalidClassReflectionError)) {

                throw e;
            }
            
            const regularReflection = reflectFunction(_target);

            const hasRegularParams = (regularReflection.params.length > 0);

            if (hasRegularParams) {

                this.cacheReflection(_target, regularReflection);

                return regularReflection;
            }

            let specialReflection;

            const specialReflectors = this.getPreset().specialReflectionCase;

            for (const reflector of specialReflectors) {

                const temp = new reflector(_target, false);

                if (temp.params.length > 0) {

                    specialReflection = temp;

                    break;
                }
            }

            const hasSpecialParam = (specialReflection) ? (specialReflection.params.length > 0) : false;

            if (hasSpecialParam) {

                this.cacheReflection(_target, specialReflection);

                return specialReflection;
            }
            else {

                this.cacheReflection(_target, regularReflection);

                return regularReflection;
            }
        }
    }

    #reflect(concrete) {

        let reflection = super.getReflectionOf(concrete);
        
        if (!concrete.constructor) {

            throw new Error(`IocContainer Error: cannot build ${concrete}`)
        }
        
        if (reflection) {

            return reflection;
        }

        try {
                
            reflection = reflecClass(concrete);
        }
        catch(error) {

            const specialReflectionCases = this.getPreset().specialReflectionCase;

            for (const reflector of specialReflectionCases) {

                try {

                    reflection = new reflector(concrete);

                    if (reflection) break;
                }
                catch(e) {}
            }
        }
        finally {

            if (!reflection) {

                reflection = reflectFunction(concrete);
            }
            // caching reflection of the concrete for further usage
            this.cacheReflection(concrete, reflection);

            return reflection;
        }
    }

    #analyzeConcrete(concrete, _scope) {

        const reflection = this.#reflect(concrete);

        const args = this.#discoverParamWithScope(reflection.params, _scope);
        
        const instance = new concrete(...args);

        return instance;
    }

    #hasScope(abstract) {

        if (typeof abstract == 'string') {

            return this.#config.getByKey(abstract) || false;
        }

        return this.#config.getScope().has(abstract);
    }

    resolveArgumentsOf(_concrete /*can be function or class*/, _scope, _asFunction = false) {

        let reflection;

        if (typeof _asFunction == 'boolean' && _asFunction === true) {

            reflection = this.#reflectAsFunction(_concrete);
        }
        else {

            reflection = this.#reflect(_concrete);
        }

        const args = this.#discoverParamWithScope(reflection.params, _scope);

        return args;
    }

    #discoverParamWithScope(list, _scope) {

        const scopeConfig = this.#config;

        //const scope = scopeConfig.getScope();
        
        const args = list.map(function(param) {

            const className = param.defaultValue;
            
            if (param.defaultValueType == Type.UNIT) {
                
                if (this.#hasScope(className)) {

                    return this.getScopeComponent(className, _scope);
                }
                else {

                    const component = this.getAbstractByKey(className);
                    
                    if (component) {

                        const concrete = this.getConcreteOf(component);

                        return this.get(concrete, _scope);
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

module.exports = ComponentManager;