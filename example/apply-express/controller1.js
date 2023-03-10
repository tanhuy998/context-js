const {BaseController, Route, Endpoint, routingContext, contentType, responseBody, Middleware} = require('../../index.js');


function log(req, res, next) {

    console.log('before Controller1', req.method , req.baseUrl + req.path);

    next();
}

function afterContorller(req, res, next) {

    console.log('after Controller1', req.method , req.baseUrl + req.path);

    next();
}

//@Route.prefix('/user') // prefix will be skip when group is declared
//@Middleware.before(log)
//@Middleware.after(afterContorller)
//@Route.group('/test')
@routingContext()
class Controller1 extends BaseController {

    constructor() {

        super();
    }

    
    //@Endpoint.GET('/')
    @Endpoint.GET('/temp')
    @Middleware.before(log)
    @Middleware.after(afterContorller)
    //@contentType('application/json')
    //@responseBody
    index() {

        const res = this.httpContext.response;

        res.send('Hello World!');

        this.httpContext.nextMiddleware();

        //return 'Hello World'
    }

    
    @Endpoint.POST('/data')
    //@contentType('application/json')
    //@responseBody
    postSomthing() {

        const req = this.httpContext.request;
        const res = this.httpContext.response;

        return {
            status: 'ok',
            yourMessage: req.body
        };
    }
}

module.exports = Controller1;