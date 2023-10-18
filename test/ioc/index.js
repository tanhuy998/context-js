const IocContainer = require('../../src/dependenies/ioc/iocContainer.js');
const {type, paramsType} = require('reflectype/src/decorators')

const container = new IocContainer();

class A {

    prop = 1;

}

class Component {

    static count = 0;

    prop 
    constructor() {

        this.prop = ++this.constructor.count;
    }
}

const {CONSTRUCTOR} = require('../../src/dependenies/constants.js');

//@bind
class B extends A {

    id;

    @paramsType(Component)
    [CONSTRUCTOR](_comp) {

        console.log(arguments);

        this.id = _comp;
    }
}

container.bindSingleton(Component, Component);
container.bind(A, B);

const obj = container.get(A);

console.log(obj.id)

// console.log(B.prototype[CONSTRUCTOR]);