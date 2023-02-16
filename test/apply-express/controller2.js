const {BaseController, routingContext, Route, Endpoint, responseBody} = require('../../index.js');

@Route.prefix('/admin')
@routingContext()
class Controller2 extends BaseController {

    constructor() {

        super();
    }

    @Endpoint.get('/')
    @responseBody
    index() {

        return 'Hello on Admin section!';
    }

    @Endpoint.get('/data')
    @responseBody
    getData() {

        const req = this.httpContext.request;
        const res = this.httpContext.response;

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