
# Context-JS

Provide abstraction on controller base programming with [Express](https://expressjs.com/) inspired by ASP.NET and Java Spring and Laravel.



## Features


- Routing and register middleware in controller definition context using decorators.
- Auto binding http context(such as request, response and next objects) to each controller object.
- Access Express's methods via given decorators in different http context.
- Dependency Injection.
- Route Group.

## Acknowledgment

This project codebase is implementing coding convention of `legacy` version of [@babel/plugin-decorator-proposal](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) which is implementing stage 1 [tc39/proposal-decorators](https://github.com/wycats/javascript-decorators/blob/e1bf8d41bfa2591d949dd3bbf013514c8904b913/README.md).
In case using this package with Typescript, we recommend using [@babel/preset-typescript](https://babeljs.io/docs/babel-preset-typescript) as transpiller instead of [tsc](https://www.npmjs.com/package/typescript) because this package is not compatible with Typescript experimental decorator.

## Usage

### Installation

npm:

```bash
npm install @tanhuy998/context-js
```

yarn:

```bash
yarn add @tanhuy998/context-js
```

#### Configuration 

Merge one of the following methods with you babel configuration. 

**.babelrc or babel.config.json**

```js
{
  "presets": [
        "@babel/preset-env"
    ],
  "plugins": [["@babel/plugin-proposal-decorators", { "version": "legacy" }]]
}
```

**package.json**

```js
{
  "babel" : {
    "presets": [
        "@babel/preset-env"
    ],
    "plugins": [["@babel/plugin-proposal-decorators", { "version": "legacy" }]]
  }
}
```

#### *update


To use decorator with class's private properties. Change the version of [@babel/plugin-decorator-proposal](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) to "2022-03".
Stage 3 of TC39-proposal-decorator supports applying decorator on private property that is not supported on Stage 1.

The config will be
```js
{
  "plugins": [["@babel/plugin-proposal-decorators", { "version": "2022-03" }]]
}
```

#### Note

The whole package does not use Decorators internally. The file which use decorator syntax must be transpiled before execution.

```js
require('@babel/register')({
    only: [
        'Path/to/The/Controller/File',
    ]
}); // to tell Babel that the file needs to be tranpiled 


const app = require('express')();
const {dispatchRequest} = require('@tanhuy998/context-js');

const Controller = require('Path/to/The/Controller/File');

app.get('/path', dispatchRequest(...Controller.action.sendSomething));
```

or you can transpile files before import it. This reduce runtime latency (spend on transpilling the syntax).

This inconvience will no longer happens when Decorator feature officially been released.

## Simple usage


Define a controller class

```js
const {BaseController, dispatchable} = require('@tanhuy998/context-js');

@dispatchable // => (optional)
class Controller extends BaseController {

    construct() {

      super();
    }

    sendSomething() {

      const res = this.httpContext.response;

      res.send('Hello World');
    }
}
```

Import into Express:

```js
require('@babel/register')({
    only: [
        'Path/to/The/Controller/File',
    ]
}); 

const app = require('express')();
const {dispatchRequest} = require('@tanhuy998/context-js');

const Controller = require('Path/to/The/Controller/File');

app.get('/path', dispatchRequest(...Controller.action.sendSomething));
```


or (without `@dispatchable` decorator)


```javascript
// when not using decorator @dispatchable on Controller
app.get('/path', dispatchRequest(Controller, 'sendSonthing'));
```


#### Go to the detail


A controller class which can be assigned to a route must extends BaseController class. Then, the controller will be dispatched a httpContext when a request arrive.

To access to the context, use `this.httpContext` (borrowing the concept of ASP.NET) inside *controllers.

The `httpContext` is an instance of HttpContext class that has regular properties

```js
{
    request: req,               // the request object dispatched from express
    response: res,              // the response object dispatched from express
    nextMiddleware: next,       // the function that point to the next handler of the current route
}
```


## Routing with Controllers

Firstly hit the codes:

```javascript
const express = require('express');
const {ApplicationContext} = require('@tanhuy998/context-js');

// Controller files must be imported before ApplicationContext resolves routes
const Controller = require('The/Controller/directory');

const app = express();

app.use('/', ApplicationContext.resolveRoutes());
```


in class definition:

Apply `@routingContext()` on class to annotate that the specific class is defining route inside


```js
const {Route, BaseController, dispatchable, routingContext} = require('@tanhuy998/context-js');

/*
* use @routingContext() decorator to annotate that the controller
* is mapping routes inside.
*/
@routingContext()
class Controller extends BaseController {

    constructor() {

      super();
    }
    
    @Route.get('/send')  // define an enpoint
    sendSomthing() {


    }
}

```

DO NOT miss the `@routingContext()` in each class definition when routing, it would cause unexpected routes mapping.

```js
@routingContext()
class FirstController extends BaseController {

    constructor() {

      super();
    }

    @Route.get('/send')
    sendSomthing() {


    }

    index() {

      conosle.log('This is the "index" method of Controller class');
    }
}

class SecondController extends BaseController {

  contructor() {

    super();
  }

  @Route.get('/index') 
  index() {

    console.log('What we want to see');
  }
}
```

When hit a request to the enpoint


```http
GET /index
```

the output on the console will print


```bash
This is the "index" method of Controller class
```


It happens because the *SecondController* has no routing context, then the `@Route.get('/index')` mapping on *SecondController* class refers to the latest routing context (*FirstController*). So, the endpoint `GET /index` will be mapped to `FirstController.index()` instead of `SecondController.index()`.
In case if the `FirstController` class did not define the `index()` method, requesting to `GET /index` would cause ***FirstController.index*** _is not a funtion_ error.



### Routes prefix 

syntax:

```js
@Route.prefix('/example')
class Controller extends BaseController {}
```

```js
const {Route, BaseController, routingContext} = require('@tanhuy998/context-js');

/*
* Route.prefix decorator affect on class.
* all the routes which is declared inside that class will be concatenated
* with the prefix
* if there is more than one is called,
* the last call of Route.prefix will affects fo
*/
@Route.prefix('/admin')
@routingContext()  // routingContext() must be placed before Route.prefix()
class Controller extends BaseController {

    constructor() {

      super();
    }

    // the route path is 'GET /user/send'
    @Route.get('/send')
    sendSomthing() {


    }
}
```


when calling multiple prefix on controller



```js
const {Route, BaseController, dispatchable, routingContext} = require('@tanhuy998/context-js');

@Route.prefix('/multiple')
@Route.prefix('/single')
@routingContext()
class Controller extends BaseController {

    constructor() {

      super();
    }

    // the enpoint's path will be 'get /multiple/send'
    // the '/single' prefix is ovetwritten
    @Route.get('/send')
    sendSomthing() {


    }
}
```


## Middleware

Apply `@Middleware` on endpoint to register middlewares to that endpoint.

Syntax:

```js
// Invokes before the controller's action.
@Middleware.before(...theMiddlewareIntances)

// invokes after the controller's action done.
@Middleware.after(...theMiddlewareIntances)

```

example

```js
const {Route, BaseController, Middleware} = require('@tanhuy998/context-js');

const bodyParser = require('body-parser');

function log(req, res, next()) {

  console.log(req.method, req.baseUrl + req.path);
  next();
}

@routingContext()
class Controller extends BaseController {

    constructor() {

      super();
    }

    @Route.post('/post')
    @Middleware.before(bodyParser.json())
    receiveSomething() {

      const req_body = this.httpContext.request.body;

    }

    @Route.get('/get')
    @Middleware.after(log)
    doSomthing() {

      // *beware that when setting middleware after a controller's action
      // we must call next() to delegate next middleware
      this.httpContext.nextMiddleware();
    }
}

```

***Note:** When a controller's action has no endpoint defined on it, all middleware applied to that action is meaningless. 


***Best practice*** 

Using `@Middleware` like the follwing example is not be adviced, it will be confusing for reading.

```js
@routingContext()
class Controller extends BaseController {

    constructor() {

      super();
    }

    @Route.post('/post')                             
    @Middleware.before(func1, func2)                    
    @Middleware.before(func3, func4, func5)          
    mistake1() {

      // the flow of route invocation will be
      // func3 -> func4 -> func5 -> func1 -> func2 -> Controller's Action   
  
    }

    @Route.get('/get')                             
    @Middleware.after(func1, func2)                    
    @Middleware.after(func3, func4, func5)
    mistake2() {

      // the flow of route invocation will be
      // Controller's Action -> func3 -> func4 -> func5 -> func1 -> func2

      this.httpContext.nextMiddleware();
    }
}

```

You are recommended to use single `@Middleware` for all middleware functions like

```js
@Middleware.before(func1, func2, func3, func4, func4)
Route.get('/get')  
controllerMethod() {

}
```

or single `@Middleware` for a single middleware function on multiple times


```js
@Middleware.before(func5)
@Middleware.before(func4)
@Middleware.before(func3)
@Middleware.before(func2)
@Middleware.before(func1)
Route.get('/get')  
controllerMethod() {

 // func1 -> func2 -> func3 -> func4 -> func5 -> Controller's Action   
}
```

## Group


Group is a way to apply particular constraint (Middlewares) on a set of endpoints.

```js
const {Route, BaseController, routingContext} = require('@tanhuy998/context-js');


@Route.group('/user')
@routingContext()
class Controller extends BaseController {

    constructor() {

      super();
    }

    // the path for of the route will be GET /user/send
    @Route.get('/send')
    sendSomthing() {


    }
}
```

#### @Route.group vs @Route.prefix 

`@Route.prefix` is just the concaternation of the prefix and the endpoint's path. The latest prefix is the one accepted to the controller.
On the other hand, group can be various on a single controller.


### Group Local Contraint

Local constraint is middlewares that is registered to all endpoint what is declared inside a controller. To add local constraint to a group, apply `@Middleware` on controller.


```js
const {Route, BaseController, routingContext} = require('@tanhuy998/context-js');
    
function log(req, res, next) {
  console.log(req);
  next()
}


@Route.group('/user')
@Middleware.before(log)
@routingContext()
class UserController extends BaseController {

    constructor() {

      super();
    }


    @Route.get('/send')
    sendSomthing() {


    }
}
```

#### Default group

If using `@Middleware` without declaring any groups immediately, the specific controller is declared with group '/' by default.

```js
const {Route, BaseController, routingContext} = require('@tanhuy998/context-js');
    
function log(req, res, next) {

  console.log(req);
  next()
}


@Middleware.before(log)
@routingContext()
class UserController extends BaseController {

    constructor() {

      super();
    }

    @Route.get('/send')
    sendSomthing() {


    }
}
```



#### Groups's local constraint Isolation

Groups in different controllers (routing context) are isolated, so their local constraints are different no matter how whose path are identical.
The following example shows how groups '/v1' is isolated  on each Controller.


```js
const {Route, BaseController, routingContext} = require('@tanhuy998/context-js');
    

function userLog() {

  console.log('user log')
}

function adminLog() {

  console.log('admin log');
}

@Route.group('/v1')
@Middleware.after(userLog)
@routingContext()
class UserController extends BaseController {

    constructor() {

      super();
    }


    @Route.get('/send')
    sendSomthing() {

        this.httpContext.nextMiddleware();
    }
}

@Middleware.after(adminLog)
@Route.group('/v1')
@routingContext()
class AdminController extends BaseController {

    constructor() {

      super();
    }


    @Route.get('/index')
    index() {

        this.httpContext.nextMiddlware();
    }
}

```


### Group Global Contraint

Global Constraint is opposite to Local Constraint. Groups that have same path will inherit global constraint that is managed on them.

```js
const {Route, BaseController, routingContext} = require('@tanhuy998/context-js');

// define global constraint for groups
Route.constraint()  // the purpose of this global constraint is to meassure the time the request is handled.
      .group('/meassure')
      .before(start) // invoke before the handlers chain of it's route
      .after(end) // invoke after the handlers chain of it's route
      .apply()

function start(req, res, next) {

  req.startTime = Date.now();
  next();
}

function end(req, res, next) {

  const now = Date.now();
  const start = req.startTime;

  console.log('the time for the request is', now - start);
}


@Route.group('/user')
@Route.group('/meassure')
@routingContext()
class UserController extends BaseController {

    constructor() {

      super();
    }

    @Route.get('/send')
    sendSomthing() {

        this.httpContext.nextMiddleware();
    }
}


@Route.group('/admin')
@Route.group('/meassure')
@routingContext()
class AdminController extends BaseController {

    constructor() {

      super();
    }

    @Route.get('/index')
    sendSomthing() {

        this.httpContext.nextMiddleware();
    }
}
```

### Desugar groups

Context.JS maps route base on Express.js's router. Consider the previous example

```js
const {Route, BaseController, routingContext, Middleware} = require('@tanhuy998/context-js');


function start(req, res, next) {

  req.startTime = Date.now();
  next();
}

function end(req, res, next) {

  const now = Date.now();
  const start = req.startTime;

  console.log('the time for the request is', now - start);
}

function userLog(req, res, next) {

  console.log('user log')

  next();
}

function adminLog(req, res, next) {

  console.log('admin log');

  next();
}

Route.constraint()
      .group('/messure')
      .before(start) // invoke before the handlers chain of it's route
      .after(end) // invoke after the handlers chain of it's route
      .apply()


@Route.group('/user')
@Route.group('/messure')
@Middleware.after(userLog)
@routingContext()
class UserController extends BaseController {

    constructor() {

      super();
    }

    @Route.get('/send')
    sendSomthing() {


    }
}


@Route.group('/admin')
@Route.group('/messure')
@Middleware.after(adminLog)
@routingContext()
class AdminController extends BaseController {

    constructor() {

      super();
    }

    @Route.get('/index')
    sendSomthing() {


    }
}
```

then Context-JS explains the related decorators to Express app how to map the routes as following.


```js
const express = require('express');
const app = express();
const {dispatchRequest} = require('contextjs');

const mainRouter = express.Router();

const userEndpoints = express.Router();
userEndpoints.get('/send', dispatchRequest(UserController, 'sendSomething'), userLog);

const adminEndpoints = express.Router();
adminEndpoints.get('/index',dispatchRequest(AdminController, 'sendSomething'), adminLog)


const messureGroup = express.Router();
messureGroup.use(userEndpoint);
messureGroup.use(adminEndpoint);


mainRouter.use('/user', userEndpoints);
mainRouter.use('/admin', adminEndpoints);
mainRouter.use('/messure', start, messureGroup, end);

app.use('/', mainRouter);


function start(req, res, next) {

  req.startTime = Date.now();
  next();
}

function end(req, res, next) {

  const now = Date.now();
  const start = req.startTime;

  console.log('the time for the request is', now - start);
}

function userLog(req, res, next) {

  console.log('user log')

  next();
}

function adminLog(req, res, next) {

  console.log('admin log');

  next();
}
```

### Priority of constraints

The flow of Constraints is described below.

```
[globalConstraint.before] -> [localConstraint.before] -> [endpointMiddleware.before] -> [Controller.action] -> [endpointMiddleware.after] -> [localConstraint.after] -> [globalConstraint.after]
```

## Dependency Injection


This package provides Dependency Injection by using an ioc container to help Javascript users on wiring dependencies between components.
Dependency Injection in this package just support two types of injection is Constructor Injection and Property Injection.
Borrowing the concept Dependency Injection of ASP.NET and Larvel's Service Container, Components has it's own lifecycle depends on which type that a particular component is bound.


## Binding components

Binding components is the way implementing the Dependency Inversion. Binding means telling the Ioc Container which component (concrete) should be injected as abstraction (base classes or interfaces).

There are three types of binding components (also called as component's lifecycle)

 - Sington: The Ioc Container just resolve the component once and then reuse it over the Node global module.
  - Scope: Like Singleton. But the component is resolved when a httpContext arrive. The component will be reuse if the context need it has controller state.
  - Transient: Each time we need a component, the ioc container will build a new intance.

```js
const {ApplicationContext} = require('express-controller-js');

ApplicationContext.useIoc();

// bind singleton
ApplicationContext.components.bindSingleton(abstract, concrete);

// bind scope
ApplicationContext.components.bindScope(abstract, concrete);

// bind transient
ApplicationContext.components.bind(abstract, concrete);

// abstract and concrete are classes or functions. The concrete must inherits the abstract.
```

### Autobinding

Autobinding is the way class binds itself as abastract and concreate

```js
const {autoBind, BindType} = require('express-controller-js');

@autoBind()  // bind itself as Transient component
class Transient {

}

@autoBind(BindType.SCOPE) // bind itself as Scope component
class Scope {
    
}

@autoBind(BindType.SINGLETON) // bind itself as Singleton component
class Singleton {
    
}
```


## Injecting dependencies

### Constructor Injection (Method Injection)

Assign the constructor's (method's) parameters default value as the component to annotate the Ioc Container the type of component you want to inject.

```js
const {autoBind, BaseController} = require('@tanhuy998/context-js')

@autoBind()
class ComponentA {}

@autoBind()
class Controller extends BaseController {
    
    prop;
    
    // inject a instance of ComponentA to the parameter
  constructor(component = ComponentA) {
    super();
    
    this.prop = component;
  }
}

```

Inject components to endpoint's handler

```js
const {autoBind, BaseController, routingContext, Endpoint} = require('@tanhuy998/context-js')

@autoBind()
class ComponentA {

  message = 'Hello World';
}

@routingContext()
@autoBind()
class Controller extends BaseController {
    
    prop;
    
    // inject a instance of ComponentA to the parameter
  constructor(component = ComponentA) {
    super();
    
    this.prop = component;
  }

  @Endpoint.GET('/')
  index(component = ComponentA) {

    console.log(component.message);
  }
}

```

*Note*: The ioc container could not inject components to async handler because Babel transforms async method into sync method that the ioc container could not read reflection to inject components correctly. Anyway, we have an alternative way to inject components to async method as the following.

```js
const {autoBind, BaseController, routingContext, Endpoint, args} = require('@tanhuy998/context-js')

@autoBind()
class ComponentA {

  message = 'Hello World';
}

@routingContext()
@autoBind()
class Controller extends BaseController {
    
    prop;
    
    // inject a instance of ComponentA to the parameter
  constructor(component = ComponentA) {
    super();
    
    this.prop = component;
  }

  @Endpoint.GET('/')
  @args(ComponentA)  // @args also effects on dependency injection
  async asyncIndex(component) {
    /**
     *  Decorator @args pass argumments to the method
     *  ioc container will lookup for possible components on @args
     */
    console.log(component.message);
  }
}

```


### Property injection

Applying `@is(Component)` to the class annotated with `@autobind` to inject the exact component. The component which is injected must be register to the ioc container as a bound component. 

```js
const {autoBind, is, BaseController} = require('@tanhuy998/context-js')

@autoBind()
class ComponentA {}

@autoBind()
class Controller extends BaseController {

  @is(ComponentA)
  prop;

  constructor() {

    super();
  }
}

```

## Response decorator

The `@Response` decorator represent the current *httpContext.response* of current http context. We can invoke some methods of the "response" object.

syntax:

```js
@Response.Method(...args)
```

example

```js
const {Route, BaseController, dispatchable, Response, routingContext} = require('@tanhuy998/context-js');

@routingContext()
class Controller extends BaseController {

    constructor() {

      super();
    }

    // Beware of using the method of Node.js native Response
    // because it works directly with STREAM and there is no buffering mechanism
    // for http operations.
    // In this example, the response status code and response header will be sent directly to the network
    @Response.writeHead(200, {
      'Content-Type': 'text/plain',
    })
    @Route.get('/index')
    sendSomthing() {

      // this.httpContext.response.status(404) will throw an Error
    }
}

```



## Controller that return response's body


We can annotate a controller to return the response body

Syntax:

```js
@responseBody
```


*Note:* using this decorator means that we will calling the *res.send(_content)* and *res.end()*, so the response session will end there but Middlewares after the controller action still invoke.


Example 


```js
const {BaseController, dispatchable, responseBody} = require('@tanhuy998/context-js');

@dispatchable
class Controller extends BaseController {

    constructor() {

      super();
    }

    
    @responseBody
    sendSomthing() {

      // equilavent to 
      // this.httpContext.response.send('Hello World!');
      // this.httpContext.response.end();

       return 'Hello World!';
    }
}
```

### @responseBody ActionResult

`@responseBody` deals with IActionResult returned by the controller's action. This package provide 4 types of ActionResult. Action result use the parameter template of Express's response object. Therefore, the following ActionResult use parameter list like standard Express's response parameter template.

```js
const {BaseController, dispatchable, responseBody, view, redirect, file, download} = require('@tanhuy998/context-js');

@dispatchable
class Controller extends BaseController {

    constructor() {

      super();
    }

    
    @responseBody
    view() {
        const data = {
            message: 'Hello world';
        }
      
      /**
       *  response a view to the client
       *  view() depends on the template engine which we register to Express instance
       */
       return view('index', data);
    }
    
    @responseBody
    file() {
        
        /**
         *  response a file to the client
         */ 
        return file('pathToFile');
    }
    
    @responseBody
    redirect() {
        
        /**
         *  rediect to a specified destination
         */ 
        return redirect('url/path');
    }
    
    @responseBody
    download() {
        
        /**
         *  response a file download to the client
         */
        return download('filePath');
    }
}
```

#### ActionResult methods

`ActionResult.status(code)`
Set the http status code of the response. An alias of Express.Response.status()

`ActionResult.header(field, [value])`
Set headers to the response. An alias of Express.Response.header()

`ActionResult.cookie(name, value [, options])`
Set cookies to the response. An alias of Express.Response.cookie()

`ActionResult.clearCookie(name [, options])`
clear cookies of the response. An alias of Express.Response.clearCookie()

Example
```js
@responseBody
someMethod() {
    
    return view('index')
            .cookie('name', 'tobi', { domain: '.example.com', path: '/admin', secure: true })
            .header({
                Keep-Alive: 'timeout=5, max=997'
            });
}
```

## Utility Decorators

#### [Unstable] @requestParam(...paramName : string) (works on both method and property)

Assign specific *request.param* to a specific instance (method and property).

Example

Apply to property

```js
class Controller extends BaseControlle {

  @requestParam('userId')
  id;


  // in this case the "info" property
  // will be assigned to 
  // {
  //     userId: this.httpContext.userId,
  //     userName: this.httpContext.userName
  // }
  @requestParam('userId', 'userName')
  info;
}
```

Apply to method (deprecated)

```js
class Controller extends BaseControlle {

    @requestParam('userId', 'userName')
    getUserInfo(id, name) {

      // the order of the params is stricted

      console.log(id, name);
    }
}
```

#### @consumes(field, [value])
Register a middleware before an endpoint to check for request headers. Will response status 400 If the request headers do not match.

Example 
```js

@comsumes({
    'User-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
})
someMethod() {
    
    // just handle request from Edge browser
}
```

#### @contentType(value : string)
Pre-set the response 'Content-Type' header, can be overwritten in controller action.

#### @header(name : string, value : string || array)
Pre-set the response header (using Express's res.setHeader method), headers can be overwritten in controller action

#### @Endpoint decorator
The *@Endpoint* is a "http method" friendly to mapping route. *@Endpoint* just focuses following methods:

```js
@Endpoint.GET(path:string)
@Endpoint.HEAD(path:string)
@Endpoint.POST(path:string)
@Endpoint.PUT(path:string)
@Endpoint.DELETE(path:string)
@Endpoint.CONNECT(path:string)
@Endpoint.OPTIONS(path:string)
@Endpoint.TRACE(path:string)
@Endpoint.PATCH(path:string)
```


## Author

- [Huy Tran](https://www.github.com/tanhuy998)


## License

[MIT](https://github.com/tanhuy998/context-js/blob/master/LICENSE)

