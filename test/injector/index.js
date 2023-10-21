const ObjectInjectorEngine = require('../../src/dependenies/injector/objectInjectorEngine');
const {CONSTRUCTOR} = require('../../src/dependenies/constants.js');

const ComponentManager = require('../../src/dependenies/component/componentManager');

const Interface = require('reflectype/src/interface/interface.js');
//const {implement} = require('reflectype/src/interface/interface.js');
const {type, paramsType} = require('reflectype/src/decorators/index.js');


class Bike {

    name = 'bike';
}

class Car {

    name = 'car';
}

class Component {

    prop = 'component';
}

class A {

    #secret;

    @type(Bike)
    accessor vehicleA;

    @type(Component)
    accessor drive;

    @paramsType(Bike)
    [CONSTRUCTOR](bike) {
        
        this.#secret = bike;

        this.vehicleA = bike;

        console.log('A', this.vehicleA);
    }

    show() {

        console.log(this.#secret);
    }
}

class B extends A {

    @type(Car)
    accessor vehicleB;

    @paramsType(Car)
    [CONSTRUCTOR](car) {
        
        this.vehicleB = car;

        console.log('B', this.vehicleB)
    }

    @paramsType(Component)
    doSomething(component) {

        console.log(component);
    }
}


const components = new ComponentManager();
components.bind(Bike, Bike);
components.bind(Car, Car);
components.bind(A, A);
components.bind(B, B);
components.bind(Component, Component);

const injector = new ObjectInjectorEngine(components.container);

const obj = new B();

injector.inject(obj);


const MethodInjectorEngine = require('../../src/dependenies/injector/methodInjectorEngine.js');

const methodInjector = new MethodInjectorEngine(components.container);

methodInjector.inject(obj, 'doSomething');

obj.doSomething();
