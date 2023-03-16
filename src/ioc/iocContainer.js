const reflectClass = require('../libs/reflectClass.js');
const reflectFunction = require('../libs/reflectFunction.js');
const {ReflectionBabelDecoratorClass_Stage_0} = require('../libs/babelDecoratorClassReflection.js');
class Empty {

    constructor() {

    };
}

class IocContainer {

    static #container = new WeakMap();

    static #stringKeys = new Map();

    static #singleton = new WeakMap();

    static #id = Date.now();

    static #preset = {
        specialReflectionCase: [],
    };

    static #metadata = {

        reflections: new WeakMap()
    }
    //var objectPool = new Set();

    static preset(_config) {

        for (const key in _config) {

            this.#preset[key] = _config[key];
        }
    }

    static cacheReflection(key, value) {

        const reflections = this.#metadata.reflections;

        if (reflections.has(key)) {

            reflections.delete(key)
        }

        reflections.set(key, value);
    }

    static bindArbitrary(key, value) {

        if (this.#stringKeys.has(key)) {

            this.#stringKeys.delete(key);
        }

        this.#stringKeys.set(key, value);
    }

    static bind(abstract, concrete, override = false) {

        if (!abstract.constructor && !concrete.constructor) {

            throw new Error('IocContainer Error: abstract and concrete must have contructor')
        }

        if (!concrete instanceof abstract) {

            throw new Error('IocContainer Error: cannot bind ' + abstract.constructor.name + ' with ' + concrete.constructor.name);
        }

        const key = abstract.name;

        if (this.#container.has(abstract) && override) {

            this.#container.delete(abstract);

            //this.#stringKeys.delete(key);
        }

        //this.#stringKeys.set(key, concrete);

        this.bindArbitrary(key, abstract);
        this.#container.set(abstract, concrete);
    }

    static bindSingleton(abstract, concrete, override = false) {

        this.bind(abstract, concrete, override);

        if (this.#singleton.has(abstract) && override) {

            this.#singleton.delete(abstract);
        }

        this.#singleton.set(abstract, new Empty());
    }

    static get(abstract) {

        if (!this.#container.has(abstract)) return undefined;
        
        const concrete = this.#container.get(abstract);

        let result;

        if (this.#singleton.has(abstract)) {

            const obj = this.#singleton.get(abstract);

            if (obj.constructor.name == "Empty") {

                const instance = this.build(concrete);

                this.#singleton.delete(abstract);
                this.#singleton.set(abstract, instance);

                //return instance;
                result = instance;
            }
            else {

                //return obj;
                result = obj;
            }
        }
        else {

            //return this.build(concrete);
            result = this.build(concrete);

        }

        console.log(this.#id, 'build', result);
        return result;
    }

    static getByKey(key) {

        if (!this.#stringKeys.has(key)) return undefined;

        const abstract = this.#stringKeys.get(key);
        
        const concrete =  this.get(abstract);

        if (concrete) {

            return concrete
        } 
        else {

            return this.build(abstract);
        }
    }

    static build(concrete) {

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
        
                return new concrete(...args);
            }
        }
        else {

            const args = this.#discoverParams(reflection.params);

            return new concrete(...args);
        }
    }
    /**
     * 
     * @param {Array<ReflectionParameter>} list 
     * @returns 
     */
    static #discoverParams(list) {



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

    // var instance = {
    //     get: _get,
    //     getByKey: _getByKey,
    //     bind: _bind,
    //     bindSingleton: _bindSingleton,
    //     bindArbitrary: _bindArbitrary,
    //     build: _build,
    //     cacheReflection: _cacheReflection,
    // }

    // return instance;
}

IocContainer.preset({
    specialReflectionCase: [ReflectionBabelDecoratorClass_Stage_0]
})

module.exports = IocContainer;



