const {BaseController, Route, Endpoint, routingContext, contentType, responseBody, Middleware} = require('../../index.js');
const IocContainer = require('../../src/ioc/iocContainer.js')

function log(req, res, next) {

    console.log('before Controller1', req.method , req.baseUrl + req.path);

    next();
}

function afterContorller(req, res, next) {

    console.log('after Controller1', req.method , req.baseUrl + req.path);

    next();
}

Route.constraint()
    .group('/messure')
    .before((req, res, next) => {

        req.startTime = Date.now();
        next();
    })
    .after((req, res, next) => {
        const end = Date.now();
        const start = req.startTime;

        console.log('Handle time', end - start)
        next();
    })
    .apply();

Route.constraint()
    .group('/user')
    .group('/test')
    .before(log)
    .apply();


class ComponentA {

    prop = Date.now()
}

IocContainer.bindSingleton(ComponentA, ComponentA);

@Route.group('/messure')
@Route.group('/user') // prefix will be skip when group is declared
//@Middleware.before(log)
@Middleware.after(afterContorller)
//@Route.group('/test')
//@Route.group('/test')
@routingContext()
class Controller1 extends BaseController {

    #component;

    constructor(_component = ComponentA, a, b, c, d) {
        
        super();

        this.#component = _component
    }

    
    //@Endpoint.GET('/')
    @Endpoint.GET('/temp')
    @Middleware.before(log)
    //@Middleware.after(afterContorller)
    //@contentType('application/json')
    @responseBody
    index() {

        const res = this.httpContext.response;

        //res.send('Hello World!');

        this.httpContext.nextMiddleware();

        return 'Hello World'
    }

    // test duplicate endpoint 
    @Endpoint.GET('/')
    //@contentType('application/json')
    @responseBody
    postSomthing() {

        const req = this.httpContext.request;
        const res = this.httpContext.response;
        console.log(this.#component)
        return {
            status: 'ok',
            yourMessage: req.body
        };
    }
}

module.exports = Controller1;