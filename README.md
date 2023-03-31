
# Context-JS

A Controller class that can interact with [Express](https://expressjs.com/) features inspired by the coding style of ASP.NET and Java Spring.



## Features


- Routing and register middleware in controller definition context using decorators.
- Auto binding http context(such as request, response and next objects) to each controller object.
- Access Express's methods via given decorators in different http context.

#### New features:

- Dependency Injection (since 1.x).
- Route Group (since 1.x).

## Acknowledgment

This project codebase is implementing coding convention of `legacy` version of [@babel/plugin-decorator-proposal](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) which is implementing stage 1 [tc39/proposal-decorators](https://github.com/wycats/javascript-decorators/blob/e1bf8d41bfa2591d949dd3bbf013514c8904b913/README.md).
In case using this package with Typescript, we recommend using [@babel/preset-typescript](https://babeljs.io/docs/babel-preset-typescript) as transpiller instead of [tsc](https://www.npmjs.com/package/typescript) because this package is not compatible with Typescript.

## Usage

### Installation

npm:

```bash
npm install express-controller-js
```

yarn:

```bash
yarn add express-controller-js
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

To use decorator with class's private properties. Change the version of [@babel/plugin-decorator-proposal](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) to "2022-03"

The config will be
```js
{
  "plugins": [["@babel/plugin-proposal-decorators", { "version": "2022-03" }]]
}
```

#### Note

The whole package does not use Decorator internally. The file which use decorator syntax must be before execution or register with @Babel.

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

or you can transpile files first then import it. This reduce runtime latency (spend on transpilling the syntax).

This inconvience will no longer happen when Decorator officially been released.

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


A controller class which can be assigned to a route must extends BaseController class. Then, the controller object will be dispatched the httpContext when a request arrive.

To access to the context, use `this.httpContext` (borrowing the concept of ASP.NET) inside *controllers.

The `httpContext` object would looks like 

```js
{
    request: req,               // the request object dispatched from express
    response: res,              // the response object dispatched from express
    nextMiddleware: next,       // the function that point to the next handler of the current route
    currentRoute: req.path,
    parentRoute: req.baseUrl,
}
```


## Routing with Controllers

Firstly hit the codes:

```javascript
const express = require('express');
const {ApplicationContext} = require('@tanhuy998/context-js');

// Controller files must be imported be for ApplicationContext resolves routes
const Controller = require('The/Controller/directory');

const app = express();

app.use('/', ApplicationContext.resolveRoutes());
```


in class definition:

use `@routingContext()` on class to annotate that the specific class is defining route inside


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

DO NOT miss the `@routingContext()` in each class definition when routing, it would cause unexpected mapping on routing.

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


It happens because the *SecondController* has no routing context, then the `@Route.get('/index')` mapping on *SecondController* class refers to the latest routing context (*FirstController*'s routing context). So, the endpoint `GET /index` will be mapped to `FirstController.index` instead of `SecondController.index`.
In case if the `FirstController` class did not define the `index` method, requesting to `GET /index` would cause ***FirstController.index*** _is not a funtion_ error.



### Routes prefix 

syntax:

```js
@Route.prefix('/example')
class Controller extends BaseController {}
```

```js
const {Route, BaseController, dispatchable, routingContext} = require('@tanhuy998/context-js');

/*
* Route.prefix decorator affect on class.
* all the routes which is declared inside that class be concatenated
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

    // the route path is 'get /user/send'
    @Route.get('/send')
    sendSomthing() {


    }
}
```


when calling multiple prefix on single class



```js
const {Route, BaseController, dispatchable, routingContext} = require('@tanhuy998/context-js');

@Route.prefit('/multiple')
@Route.prefix('/single')
@routingContext()
class Controller extends BaseController {

    constructor() {

      super();
    }

    // the current route path will be 'get /multiple/send'
    // the '/single' prefix is ovetwritten
    @Route.get('/send')
    sendSomthing() {


    }
}
```


## Middleware for endpoints

Apply `@Middleware` on Controller's method to register middlewares on an endpoint.

Syntax:

```js
// Invokes before the controller's action.
@Middleware.before(...theMiddlewareIntances)

// invokes after the controller's action done.
@Middleware.after(...theMiddlewareIntances)

```

example

```js
const {Route, BaseController, dispatchable, Middleware} = require('@tanhuy998/context-js');

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

***Note:** When controller's action that is not defining route, all middleware applied to that action is meaningless. 


***Best practice*** 

Using `@Middleware` like the follwing example is not be adviced, it will be confusing to reading codes

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

We recommemd to use single `@Middleware` for all middleware functions like

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

## Grouping routes (since version 0.1.x)


Group routes is a way to group enpoints in in order to apply constraints to the group's members. Something we want a set of endpoints passthrough some middlewares.

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

`@Route.prefix` is just the concaternation of the prefix and endpoint's path, each Controller class (a routing context) contains just only one prefix.
On the other hand, a Controller Class (a routing context) can be declared with more than one group that each group has different constraints for specific purposes (such as testing).


### Group Local Contraints

Local constraint is middlewares that applied to groups that are declared on a controller. To add local constraint to a group, apply `@Middleware` on controller.


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

If using `@Middleware` without declaring any groups immediately, the specific controller class is declared with default group '/'

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
The following example show how groups is isolated. '/v1' on each Controller.


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

        this.httpContext.response.next();
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

Global Constraint is inversion of Local Constraint. Groups that have path which is managed with Global Contraint will have the inherit the same constraint

```js
const {Route, BaseController, routingContext} = require('@tanhuy998/context-js');

// define global constraint for groups
Route.constraint()  // the purpose of this global constraint is to meassure the time the request is handled.
      .group('/messure')
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
@Route.group('/messure')
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
@Route.group('/messure')
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

### Desugaring the flow of controll of route group

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

## Dependency injection (since 1.x)


This package provides Dependency Injection by using an ioc container to help Javascript user on wiring dependencies between components.
Dependency Injection of this package just support two type of injection is Constructor Injection and Property Injection.
Borrowing the concept Dependency Injection of ASP.NET, Components (also known a Dependencies) has it's own lifecycle depend on which type of binding.

  - Sington: The Ioc Container just resolve the component once and then reuse it over the application.
  - Scope: Like Singleton. But the component is resolved when a httpContext arrive. This component will be reuse on context of a .
  - Transient: Each time we need a component, the ioc container will resolve a new intance.


### Binding components

Binding components is the way implementing the Dependency Inversion. Binding means telling the Ioc Container which component (concrete) should be injected as abstraction (base classes or interfaces).

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

Autobinding is the way class binding itseflt as abastract and concreate

```js
const {autoBind, BindType} = require('express-controller-js');

@autoBind()  // bind itself as Transient component
class Transient {

}

@autoBind(BindType.SCOPE) // bind itself as Scope component
class Scope {
    
}

@autoBind(BindType.SINGLETON) / bind itself as Singleton component
class Singleton {
    
}
```


### Injecting dependencies

#### Constructor injection 

On the constructor parameters, set the constructor's parameters default value as the component class to annotate the Ioc Container which type of component you want to inject.

```js
const {autoBind, BaseController} = require('@tanhuy998/context-js')

@autoBind()
class AutoBindClass {

  
}

@autoBind()
class Controller extends BaseController {
    
    prop;
    
    // inject a instance of AutoBindClass to the parameter
  constructor(component = AutoBindClass) {
    super();
    
    this.prop = component;
  }
}

```

#### Property injection

```js
const {autoBind, is, BaseController} = require('@tanhuy998/context-js')

@autoBind()
class AutoBindClass {

  
}

@autoBind()
class Controller extends BaseController {

  @is(AutoBindClass)
  prop;

  constructor() {

    super();
  }
}

```

## Response decorator

The `@Response` decorator represent the current *httpContext.response* of current http context. We can invoke all the method of the "response" object.

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


We can annotate annotate a controller to return the response body

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

`@responseBody` deals with IActionResult returned by the controller's action. This package provide 4 types of ActionResult.

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
    
       return view('index', data);
    }
    
    @responseBody
    file() {
        
        return file('pathToFile');
    }
    
    @responseBody
    redirect() {
        
        return redirect('url/path');
    }
    
    @responseBody
    download() {
        
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

#### @requestParam(...paramName : string) [Unstable] (works on both method and property)

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
Register a middleware before the controller's action to check for request headers. response status 400 If the request headers do not match.

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

### And more will be comming soon!


## Authors

- [Huy Tran](https://www.github.com/tanhuy998)


## License

[MIT](https://github.com/tanhuy998/context-js/blob/master/LICENSE)

