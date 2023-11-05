const ObjectInjectorEngine = require('../injector/objectInjectorEngine.js');
const IocContainer = require('../ioc/iocContainer.js');
const Scope = require('./scope.js');


module.exports = class ComponentContainer extends IocContainer {

    constructor() {

        super();
    }

    /**
     * @override
     * @param {Object} abstract 
     * @param {Scope} _scope 
     * @returns {Object | undefined}
     */
    get(abstract, _scope) {
        
        if (super.hasSingleton(abstract)) {

            return super.get(abstract);
        }

        return this.#lookup(abstract, _scope);
    }



    /**
     * 
     * @param {Object} abstract 
     * @param {Scope} _scope 
     * @returns {Object | undefined}
     */
    #lookup(abstract, _scope) {
        
        if (!_scope || !(_scope instanceof Scope)) {
            
            return super.get(abstract);
        }

        return this.#resolveComponent(abstract, _scope);
    }

    /**
     * 
     * @param {Object} abstract 
     * @param {Scope} _scope 
     * @returns {Object | undefined}
     */
    #resolveComponent(abstract, _scope) {
        /**
         *  if abstract is scope component
         *  container leaves decision to the scope object to instantiate the instance
         *  
         *  if abstract is singleton component
         *  just resolve component as usual, singleton components are related to any scope components
         * 
         *  if abstract is transient component
         *  inside transient components might denpend on components that are marked as scope component
         */

        if (_scope.has(abstract)) {

            if (!_scope.isLoaded(abstract)) {
               
                _scope.load(abstract, this);
            }
            
            return _scope.get(abstract);
        }

        return this.build(abstract, _scope);        
    }

    /**
     * Overide IocContainter.build() method.
     * ComponentContainer instantiate context level components.
     * Therefore, transient component may also require scope components inside it.
     * 
     * @param {*} _abstract 
     * @param {*} _scope 
     * @returns 
     */
    build(_abstract, _scope) {

        /**@type {Function} */
        const concrete = this.getConcreteOf(_abstract);
        
        let instance = typeof concrete === 'function' ? new concrete() : new _abstract(); 

        const injector = new ObjectInjectorEngine(this);

        injector.inject(instance, _scope);

        return instance;
    }
}