
const ControllerState = require('./controllerState.js');
const reflecClass = require('../libs/reflectClass.js');
const reflectFunction = require('../libs/reflectFunction.js');
const {Type} = require('../libs/type.js');
const IocContainer = require('../ioc/iocContainer.js');
const ControllerConfiguration = require('./controllerConfiguration.js');
const {ReflectionBabelDecoratorClass_Stage_3} = require('../libs/babelDecoratorClassReflection.js');



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

        this.#config.bindScope(abstract, concrete);
    }

    setConfig(config) {

        if (config instanceof ControllerConfiguration) {

            this.#config = config;
        }
    }

    buildController(_concrete) {

        if (!this.#config) throw new Error('ControllerComponentManager Error: there is no configuration to handle.');
        
        const controllerState = new ControllerState(this.#config);

        const instance = this.#analyzeConcrete(_concrete, controllerState);

        instance.setState(controllerState);

        return instance;
    }

    get(abstract, _controllerState) {

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

            return this.#analyzeConcrete(concrete, _controllerState);
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
                
                reflection = reflectClass(concrete);
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
        
        return new concrete(...args);
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

            if (param.defaultValueType == Type.UNIT && className) {

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
}

module.exports = ControllerComponentManager;