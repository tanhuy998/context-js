//const IocContainer = require('../../src/dependenies/ioc/iocContainer.js');
const {type, paramsType} = require('reflectype/src/decorators')

//const container = new IocContainer();

class A {

    prop = 1;

}

class component {


}

class B extends A {

    id;

    // @paramsType(component)
    ['constructor'](_comp) {

        console.log(arguments);

        this.id = _comp;
    }

    
    // constructor(_comp) {

    //     console.log(_comp);

    //     super();
    // }
}

//container.bind(A, B);

//const obj = container.build(B);



const obj = new B('á');

console.log(obj.id)

console.log(B.prototype.constructor.toString());