const {BaseController, Route, Endpoint, routingContext, contentType, responseBody} = require('../../index.js');


@Route.prefix('/user')
@routingContext()
class Controller1 extends BaseController {

    constructor() {

        super();
    }

    @Endpoint.get('/')
    @contentType('application/json')
    index() {

        const res = this.httpContext.response;

        res.send('Hello World!');
    }

    @Endpoint.post('/data')
    @contentType('application/json')
    @responseBody
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