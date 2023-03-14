const IocContainer = require('./iocContainer.js');

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

const container = IocContainer();

container.bindSingleton(A, B);
container.bind(C, C);

console.log(container.getByKey('A'));
console.log(container.get(A).random);