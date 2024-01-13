// const Context = require('../../context');
// const coodinator = require('../../coordinator/');
// const decorator = require('../../decorator');
// const handler = require('../../handler');
// const pipeline = require('../../pipeline');
// const signal = require('../../pipeline/signal');

// console.log(Context);
// console.log(coodinator);
// console.log(decorator);
// console.log(handler);
// console.log(pipeline);
// console.log(signal);

const ReflectionClassPrototype = require('reflectype/src/metadata/prototypeReflection/reflectionClassPrototype');

class A {

    #prop = 1;

    func() {

        console.log(this.#prop);
    }
}

function func(...args) {

    args.pop()

    console.log(args)
}

const obj = new A();
