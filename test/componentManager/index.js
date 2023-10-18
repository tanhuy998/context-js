


const ComponentManager = require('../../src/dependenies/component/componentManager.js');

const components = new ComponentManager();
const Interface = require('reflectype/src/interface/interface.js');
const {implement} = require('reflectype/src/');

class ITest extends Interface {

    doSomething() {


    }
}

@implement(ITest)
class A {

    static count = 0;

    prop;

    constructor() {

        this.prop = ++this.constructor.count;
    }

    doSomething() {


    }
}

const Scope = require('../../src/dependenies/component/scope.js');

components.bindScope(A, A);
components.bindScope(ITest, A);

const scope = components.get(Scope);

const obj = components.get(ITest, scope);

const obj2 = components.get(A);

const obj3 = components.get(A, scope);

const obj4 = components.get(ITest, scope);

console.log(obj); // 1
console.log(obj2.prop); // 2
console.log(obj3.prop); // 3
console.log(obj4.prop)


