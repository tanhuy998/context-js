require('@babel/register')({
    only: [
        './controller1.js',
        './controller2.js'
    ]
});

const express = require('express');
const {RouteContext, Route} = require('../../index.js');
const IocContainer = require('../../src/ioc/iocContainer.js');
const {BaseController} = require('../../index.js');
const {ReflectionBabelDecoratorClass_Stage_0} = require('../../src/libs/babelDecoratorClassReflection.js');

const body_parser = require('body-parser');

BaseController.useIoc();
RouteContext.init(express);


const Controller1 = require('./controller1.js');
const Controller2 = require('./controller2.js');

const container = IocContainer;

container.bind(Controller1, Controller1);
container.bind(Controller2, Controller2);



//const reflect = new ReflectionBabelDecoratorClass_Stage_0(Controller1);

// console.log(container.get(Controller1))
console.time('init')
const port = 3000;
const app = express();

app.use(body_parser.json());

const router = RouteContext.resolve();
//app.use(log);
app.use('/', router);

// router.stack.forEach(element => {
    
//     console.log(element.handle.stack);
// })

//console.log(router.stack[1].handle.stack[0].handle);

app.listen(port, () => {

    console.log('app listen on port', port)

    console.timeEnd('init')
})
