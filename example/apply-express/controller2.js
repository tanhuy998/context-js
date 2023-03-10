const {BaseController, routingContext, Route, Endpoint, responseBody, Middleware} = require('../../index.js');

function log(req, res, next) {

    console.log('admin')
    //res.end();
    next();
}

@Middleware.after(log)
@Route.group('/test')
@routingContext()
class Controller2 extends BaseController {

    constructor() {

        super();
    }

    @Endpoint.GET('/')
    @responseBody
    index(a, b) {

        return 'Hello on Admin section!';
    }

    //@Middleware.before(log)
    @Endpoint.GET('/data')
    @responseBody
    getData() {

        const req = this.httpContext.request;
        const res = this.httpContext.response;
        
        console.log('No Authentication');
        //this.httpContext.nextMiddleware();

        if (!req.user) {
            
            res.status(403);
            
            //console.log('no auth', res.headersSent);
            //this.httpContext.nextMiddleware();
            return 'No Authentication';
        }
        
        return 'Nothing to retrieve';
    }

}

module.exports = Controller2;