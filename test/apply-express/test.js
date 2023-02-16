require('@babel/register')({
    only: [
        './controller1.js',
        './controller2.js'
    ]
});

const express = require('express');
const {RouteContext, Route} = require('../../index.js');
const body_parser = require('body-parser');

const Controller1 = require('./controller1.js');
const Controller2 = require('./controller2.js');

RouteContext.init(express);


function log(req, res, next) {

    console.log(req.method , req.baseUrl + req.path);

    next();
}

const port = 3000;
const app = express();

app.use(body_parser.json());
app.use(log);
app.use('/', RouteContext.resolve());


app.listen(port, () => {

    console.log('app listen on port', port)
})


