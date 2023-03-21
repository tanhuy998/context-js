const {BaseController, Route, Endpoint, routingContext, contentType, responseBody, Middleware} = require('../../index.js');
const {autoBind, is, BindType} = require('../../src/ioc/decorator.js')
const IocContainer = require('../../src/ioc/iocContainer.js')
const {consumes} = require('../../src/request/decorator.js');

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

        const label = Date.now().toString();

        console.time(label);

        req.startTime = label;

        next();
    })
    .after((req, res, next) => {
        
        const label = req.startTime;

        console.log('Handle time');
        console.timeEnd(label);
        next();
    })
    .apply();

Route.constraint()
    .group('/user')
    .group('/test')
    .before(log)
    .apply();

@autoBind(BindType.SINGLETON)
class ComponentA {

    static count = 0;

    constructor() {

        this.number = ++(ComponentA.count);
    }

    number;
    prop = Date.now()
}

//IocContainer.bindSingleton(ComponentA, ComponentA);
// BaseController.configuration.bindScope(ComponentA, ComponentA)

@Route.group('/messure')
@Route.group('/user') // prefix will be skip when group is declared
//@Middleware.before(log)
@Middleware.after(afterContorller)
//@Route.group('/test')
//@Route.group('/test')
@routingContext()
@autoBind()
class Controller1 extends BaseController {

    #component;
    #prop;

    @is(ComponentA)
    component

    constructor(_component = ComponentA, a = 'asdasd', b = ComponentA, c, d) {
        
        super();

        this.#prop = a;

        console.log(_component, b);

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
    @consumes({
        'User-Agent' : 'Edge'
    })
    //@contentType('application/json')
    @responseBody
    postSomthing() {

        const req = this.httpContext.request;
        const res = this.httpContext.response;
        console.log(this.#component, this.#prop, this.component)
        return {
            status: 'ok',
            yourMessage: req.body
        };
    }
}

console.log(Controller1.prototype)

module.exports = Controller1;