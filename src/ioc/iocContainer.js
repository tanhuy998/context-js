const reflectClass = require('../libs/reflectClass.js');
const reflectFunction = require('../libs/reflectFunction.js');
const {ReflectionBabelDecoratorClass_Stage_0} = require('../libs/babelDecoratorClassReflection.js');
const { contentType } = require('../response/decorator.js');
const { PropertyDecorator } = require('../decorator/decoratorResult.js');
const {EventEmitter} = require('node:events');

class Empty {

    constructor() {

    };
}

class IocContainer extends EventEmitter {

    #container = new WeakMap();

    #stringKeys = new Map();

    #singleton = new WeakMap();

    #id = Date.now();

    #preset = {
        specialReflectionCase: [ReflectionBabelDecoratorClass_Stage_0],
    };

    #metadata = {

        reflections: new WeakMap()
    }
    //var objectPool = new Set();

    constructor() {

        super();
    }

    preset(_config) {

        for (const key in _config) {

            this.#preset[key] = _config[key];
        }
    }

    getPreset() {

        return this.#preset;
    }

    cacheReflection(key, value) {

        const reflections = this.#metadata.reflections;

        if (reflections.has(key)) {

            reflections.delete(key)
        }

        reflections.set(key, value);
    }

    getReflectionOf(key) {

        if (!this.#metadata.reflections.has(key)) return undefined;

        return this.#metadata.reflections.get(key);
    }

    bindArbitrary(key, value) {

        if (this.#stringKeys.has(key)) {

            this.#stringKeys.delete(key);
        }

        this.#stringKeys.set(key, value);
    }

    bind(abstract, concrete, override = false) {

        this.checkType(abstract, concrete);

        const key = abstract.name;

        if (this.#container.has(abstract) && override) {

            this.#container.delete(abstract);

            //this.#stringKeys.delete(key);
        }

        //this.#stringKeys.set(key, concrete);

        this.bindArbitrary(key, abstract);
        this.#container.set(abstract, concrete);
    }

    checkType(abstract, concrete) {

        // const concreteType = (typeof concrete);
        // const abstractType = (typeof abstract);

        if (!abstract.constructor && !concrete.constructor) {

            throw new Error('IocContainer Error: abstract and concrete must have contructor')
        }

        if (abstract == concrete) return;

        let prototype = abstract.__proto__;

        while(prototype !== null) {

            if (prototype === concrete) {

                return;
            }

            prototype = prototype.__proto__;
        } 

        throw new Error('IocContainer Error: cannot bind ' + abstract.constructor.name + ' with ' + concrete.constructor.name);
    }

    bindSingleton(abstract, concrete, override = false) {

        this.bind(abstract, concrete, override);

        if (this.#singleton.has(abstract) && override) {

            this.#singleton.delete(abstract);
        }

        this.#singleton.set(abstract, new Empty());
    }

    has(_abstract) {

        return this.#container.has(_abstract);
    }

    hasKey(key) {

        return this.#stringKeys.has(key);
    }

    getConcreteByKey(key) {

        const abstract = this.getAbstractByKey(key);

        if (abstract) {

            return this.getConcreteOf(abstract);
        }
        else {

            return undefined;
        }
    }

    getConcreteOf(abstract) {

        if (!this.#container.has(abstract)) return undefined;

        return this.#container.get(abstract);
    }

    getAbstractByKey(key) {

        if (!this.#stringKeys.has(key)) return undefined;

        return this.#stringKeys.get(key);
    }

    hasSingleton(_abstract) {

        return this.#singleton.has(_abstract);
    }

    get(abstract) {

        if (!this.#container.has(abstract)) return undefined;
        
        const concrete = this.#container.get(abstract);

        let result;

        if (this.#singleton.has(abstract)) {

            this.#notifyResolvedComponent(instance, abstract, concrete)

            const obj = this.#singleton.get(abstract);

            if (obj.constructor.name == "Empty") {

                const instance = this.build(concrete);

                this.#singleton.delete(abstract);
                this.#singleton.set(abstract, instance);

                result = instance;
            }
            else {

                result = obj;
            }
        }
        else {

            //return this.build(concrete);
            result = this.build(concrete);

        }

        //console.log(this.#id, 'build', result);
        return result;
    }

    getByKey(key) {

        if (!this.#stringKeys.has(key)) return undefined;

        const abstract = this.#stringKeys.get(key);
        
        const concrete =  this.get(abstract);

        if (concrete) {

            return concrete;
        } 
        else {

            return this.build(abstract);
        }
    }

    build(concrete) {

        let reflection = this.#metadata.reflections.get(concrete);

        if (!concrete.constructor) {

            throw new Error(`IocContainer Error: cannot build ${concrete}`)
        }
        
        if (!reflection) {

            try {
                
                reflection = reflectClass(concrete);
            }
            catch(error) {

                const specialReflectionCases = this.#preset.specialReflectionCase;

                for (const reflector of specialReflectionCases) {

                    try {

                        reflection = new reflector(concrete);
                    }
                    catch(e) {


                    }

                    if (reflection) break;
                }
            }
            finally {

                if (!reflection) {

                    reflection = reflectFunction(concrete);
                }
                // caching reflection of the concrete for further usage
                this.#metadata.reflections.set(concrete, reflection);

                const args = this.#discoverParams(reflection.params);
        
                const instance = new concrete(...args);

                this.#notifyNewInstance(instance, concrete);

                return instance;
            }
        }
        else {

            const args = this.#discoverParams(reflection.params);

            const instance = new concrete(...args);

            this.#notifyNewInstance(instance, concrete);

            return instance;
        }
    }
    /**
     * 
     * @param {Array<ReflectionParameter>} list 
     * @returns 
     */
    #discoverParams(list) {



        const result = list.map((param) => {
            
            if (param.defaultValue != undefined && !param.isTypeOfString) {
                //console.log(1, param.defaultValue != undefined)
                const arg = this.getByKey(param.defaultValue);

                return arg;
            }
            else {

                return undefined;
            }
        });

        return result;
    }

    #notifyResolvedComponent(_instance, _abstract, _concrete) {

        this.emit('resolveComponets', _instance, _abstract, _concrete);
    }

    #notifyNewInstance(_instance, _concrete) {

        this.emit('newInstance', _instance, _concrete);
    }

}

module.exports = IocContainer;



