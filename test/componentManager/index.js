


const ComponentManager = require('../../src/dependenies/component/componentManager.js');

const components = new ComponentManager();

class A {

    static count = 0;

    prop;

    constructor() {

        this.prop = ++this.constructor.count;
    }
}
const Scope = require('../../src/dependenies/component/scope.js');

components.bindScope(A, A);

const scope = components.get(Scope);

const obj = components.get(A, scope);

const obj2 = components.get(A);

const obj3 = components.get(A, scope);

console.log(obj.prop); // 1
console.log(obj2.prop); // 2
console.log(obj3.prop); // 1


