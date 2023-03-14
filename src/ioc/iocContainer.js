const reflectClass = require('../libs/reflectClass.js');
const reflectFunction = require('../libs/reflectFunction.js')

class Empty {

    constructor() {

    };
}

function IocContainer() {

    var _container = new WeakMap();

    var _stringKeys = new Map();

    var _singleton = new WeakMap();

    var _metadata = {

        reflections: new WeakMap()
    }
    //var objectPool = new Set();

    function _cacheReflection(key, value) {

        const reflections = _metadata.reflections;

        if (reflections.has(key)) {

            reflections.delete(key)
        }

        reflections.set(key, value);
    }

    function _bindArbitrary(key, value) {

        if (_stringKeys.has(key)) {

            _stringKeys.delete(key);
        }

        _stringKeys.set(key, value);
    }

    function _bind(abstract, concrete, override = false) {

        if (!abstract.constructor && !concrete.constructor) {

            throw new Error('IocContainer Error: abstract and concrete must have contructor')
        }

        if (!concrete instanceof abstract) {

            throw new Error('IocContainer Error: cannot bind ' + abstract.constructor.name + ' with ' + concrete.constructor.name);
        }

        const key = abstract.name;

        if (_container.has(abstract) && override) {

            _container.delete(abstract);

            //_stringKeys.delete(key);
        }

        //_stringKeys.set(key, concrete);

        _bindArbitrary(key, abstract);
        _container.set(abstract, concrete);
    }

    function _bindSingleton(abstract, concrete, override = false) {

        _bind(abstract, concrete, override);

        if (_singleton.has(abstract) && override) {

            _singleton.delete(abstract);
        }

        _singleton.set(abstract, new Empty());
    }

    function _get(abstract) {

        if (!_container.has(abstract)) return undefined;

        const concrete = _container.get(abstract);

        if (_singleton.has(abstract)) {

            const obj = _singleton.get(abstract);

            if (obj.constructor.name == "Empty") {

                const instance = _build(concrete);

                _singleton.delete(abstract);
                _singleton.set(abstract, instance);

                return instance;
            }
            else {

                return obj;
            }
        }
        else {

            return _build(concrete);
        }
    }

    function _getByKey(key) {

        if (!_stringKeys.has(key)) return undefined;

        const abstract = _stringKeys.get(key);
        
        const concrete =  _get(abstract);

        if (concrete) {

            return concrete
        } 
        else {

            return _build(abstract);
        }
    }

    function _build(concrete) {

        let reflection = _metadata.reflections.get(concrete);

        if (!concrete.constructor) {

            throw new Error(`IocContainer Error: cannot build ${concrete}`)
        }

        if (!reflection) {

            try {

                reflection = reflectClass(concrete);
            }
            catch(error) {

                if (error.constructor.name == 'InvalidClassReflectionError') {

                    reflection = reflectFunction(concrete);
                }
            }
        }

        const args = _discoverParams(reflection.params);
        
        return new concrete(...args);
    }
    /**
     * 
     * @param {Array<ReflectionParameter>} list 
     * @returns 
     */
    function _discoverParams(list) {



        const result = list.map((param) => {
            
            if (param.defaultValue != undefined && !param.isTypeOfString) {
                //console.log(1, param.defaultValue != undefined)
                const arg = _getByKey(param.defaultValue);

                return arg;
            }
            else {

                return undefined;
            }
        });

        return result;
    }

    var instance = {
        get: _get,
        getByKey: _getByKey,
        bind: _bind,
        bindSingleton: _bindSingleton,
        bindArbitrary: _bindArbitrary,
        build: _build,
        cacheReflection: _cacheReflection,
    }

    return instance;
}

module.exports = IocContainer;

class A {}

class C {
    prop = 'hello world'
}

class B extends A {

    random = Date.now();
    state;


    constructor(init = C, a) {

        super();

        this.state = init;
    }
}

module.exports = IocContainer;

const container = IocContainer();

container.bindSingleton(A, B);
container.bind(C, C);



console.log(container.getByKey('A'));
console.log(container.get(A).random);