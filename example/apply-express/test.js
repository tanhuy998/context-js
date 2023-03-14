

require('@babel/register')({
    only: [
        './controller1.js',
        './controller2.js'
    ]
});

const express = require('express');
const {RouteContext, Route} = require('../../index.js');
const body_parser = require('body-parser');

RouteContext.init(express);

const Controller1 = require('./controller1.js');
const Controller2 = require('./controller2.js');


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

    
})


