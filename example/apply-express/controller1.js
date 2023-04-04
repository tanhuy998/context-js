let {BaseController, is, Route, Endpoint, routingContext, contentType, consumes, responseBody, Middleware, file, autoBind, BindType, redirect, download, view} = require('../../index.js');
const path = require('path');


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
@autoBind()
class Atom {

    static count = 0;

    constructor() {

        this.number = ++(Atom.count);
    }
}

@autoBind(BindType.SCOPE)
class ComponentA {

    @is(Atom)
    prop

    static count = 0;
    static list = [];

    constructor() {

        this.number = ++(ComponentA.count);

        ComponentA.list.push(this);
    }

    number;
    prop = Date.now()
}

//console.log(BaseController.iocContainer.get(ComponentA))

//IocContainer.bindSingleton(ComponentA, ComponentA);
// BaseController.configuration.bindScope(ComponentA, ComponentA)

@Route.group('/messure')
@Route.group('/user') // prefix will be skip when group is declared
@Middleware.before(log)
//@Middleware.after(afterContorller)
@routingContext()
//@autoBind()
class Controller1 extends BaseController {

    //@is(ComponentA)
    #component;
    #prop;

    //@is(ComponentA)
    component

    constructor(_component = ComponentA, a = Atom, b = ComponentA, c = Atom, d) {
        
        super();

        this.#prop = a;

        console.log('constructor', a, c);
        
        
        //this.#component = _component;
    }

    
    //@Route.get('/')
    @Endpoint.GET('/temp')
    @Middleware.before(log)
    @Middleware.after(afterContorller)
    //@contentType('application/json')
    @responseBody
    index() {

        const res = this.httpContext.response;

        //res.send('test stage3')
        
        //res.send('Hello World!');

        //this.httpContext.nextMiddleware();
        console.log('component', this.#component, this.component);

        return view('index', {data: 'Hello World!'})
        .cookie('testCookie', 'value');
    }

    // test duplicate endpoint 
    
    @Middleware.before(log)
    @Middleware.after(afterContorller)
    @Endpoint.GET('/')
    @responseBody
    postSomthing() {

        const req = this.httpContext.request;
        const res = this.httpContext.response;
        console.log(this.#component, this.#prop, this.component)

        const filePath = path.join(__dirname, './static/new.js');

        console.log(filePath);

        // return ('/messure/temp');   

        return view('index', {data: 'Hello World!'})
                .cookie('testCookie', 'value');

        //return 'test';

        // return {
        //     status: 'ok',
        //     yourMessage: req.body
        // };
    }
}

module.exports = Controller1;