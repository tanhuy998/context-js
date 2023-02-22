
# EXPRESS-CONTROLLER-JS

A Controller class that can interact with [Express](https://expressjs.com/) features inspired by the coding style of ASP.NET and Java Spring.



## Features


- Routing and register middleware in controller definition context using decorators.
- Auto binding http context(such as request, response and next objects) to each controller object.
- Access some Express's methods via given decorators.

## Acknowledgment

This project use the `legacy` version of [@babel/plugin-decorator-proposal](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) which is implementing stage 1 [tc39/proposal-decorators](https://github.com/wycats/javascript-decorators/blob/e1bf8d41bfa2591d949dd3bbf013514c8904b913/README.md).

In case using this package with Typescript, we recommend using [@babel/preset-typescript](https://babeljs.io/docs/babel-preset-typescript) instead of [tsc](https://www.npmjs.com/package/typescript) because the conflict between [@babel/plugin-decorator-proposal](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) (`legacy` version implements stage 1 [tc39/proposal-decorators](https://github.com/wycats/javascript-decorators/blob/e1bf8d41bfa2591d949dd3bbf013514c8904b913/README.md)) and [tsc/experimentalDecorators](https://www.typescriptlang.org/docs/handbook/decorators.html) (currently implements stage 2 [tc39/proposal-decorators](https://github.com/tc39/proposal-decorators/tree/7fa580b40f2c19c561511ea2c978e307ae689a1b)).

In Typescript, you will face the type-checking issue with ES6 javascript's Proxy. This issue is being handled for future stable adaption with Typescript.

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

#### Simple usage


Define a controller class



```js
const {BaseController, dispatchable} = require('express-controller');

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
const app = require('express')();
const {dispatchRequest} = require('express-controller');

const Controller = require('The/Controller/directory');

app.get('/path', dispatchRequest(...Controller.action.sendSomething));
```


or (without `@dispatchable` decorator on class)


```javascript
// when not using decorator @dispatchable on Controller
app.get('/path', dispatchRequest(Controller, 'sendSonthing'));
```


#### Go to the detail


A controller class which can be assigned to a route must extends (instance of) BaseController class. Then, the controller object will be dispatched the http's context when a request arrive.

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

The `@dispatchable` decorator is optional to apply to controller. Use `@dispatchable` when you want to to use the syntax `...Controller.action.sendSomething` (just only in readable manner). the pattern for the syntax is `...[youControllerClass].action.[theControllerMethodYouWantToBeDispatch]`.




## Routing with Contorllers



Firstly hit the codes:



```javascript
const express = require('express');
const {RouteContext} = require('express-controller');

RouteContext.init(express);

const Controller = require('The/Controller/directory');

const app = express();

app.use('/', RouteContext.resolve());
```




in class definition:

use `@routingContext()` on class to annotate that the specific class is defining route inside



```js
const {Route, BaseController, dispatchable, routingContext} = require('express-controller');

/*
* use routingContext() decorator to annotate that this class
* is mapping routes inside.
* routingContext() must be placed before all routing decorators 
* that affects on class.
*/
@routingContext()
class Controller extends BaseController {

    constructor() {

      super();
    }

    @Route.get('/send')
    sendSomthing() {


    }
}

```

**importance:** We must import `const {RouteContext} = require('express-controller')` on the highest priority (before importing controllers). 


_notice:_ the `@Route` decorator represents the Router generated by Express. Therefore, we could access to another standard **method** of the Express's router.


***RESTRICTION!***  DO NOT miss the `@routingContext()` in each class definition when routing, it would cause unexpected mapping on routing.

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


It happened because there is currently only one routing context for *FirstController* class, then the `@Route.get('/index')` mapping on *SecondController* class refers to the current routing context (*FirstController*) so that the route will be mapped with `FirstController.index` instead of `SecondController.index`.

In case if the `FirstController` class did not define the `index` method, requesting to `GET /index` would cause ***FirstController.index*** _is not a funtion_ error.


```js
@routingContext()
class FirstController extends BaseController {

    constructor() {

      super();
    }

    @Route.get('/send')
    sendSomthing() {


    }
}

class SecondController extends BaseController {

  contructor() {

    super();
  }

  @Route.get('/index') 
  index() {

    // requesting to GET /index will cause "Controller.index is not a funtion"
    console.log('What we want to see');
  }
}
```


### Routes prefix 


syntax:



```js
@Route.prefix('/example')
class Controller extends BaseController {}
```

```js
const {Route, BaseController, dispatchable, routingContext} = require('express-controller');

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

    // the current route path is 'get /user/send'
    @Route.get('/send')
    sendSomthing() {


    }
}
```


when calling multiple prefix on single class



```js
const {Route, BaseController, dispatchable, routingContext} = require('express-controller');

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

## Middleware for routes


We can add Middlewares to the flow of route invocation. The way that this module can do is just being a wrapper for the Express's router. It catches decorators and caches decorators metadata, then stranspile it the a specific operations on the router.



Syntax:



```js
// Invokes before the controller's action.
@Middleware.before(...theMiddlewareIntances)

// invokes after the controller's action done.
@Middleware.after(...theMiddlewareIntances)

```


example



```js
const {Route, BaseController, dispatchable, Middleware} = require('express-controller');

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


***ALERT!*** 

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



## Response reference decorator

The `@Response` decorator represent the current *httpContext.response* of current http context. We can invoke all the method of the "response" object.

syntax:

```js
@Response.theMethodYouWantToAccess(...args)
```


example



```js

const {Route, BaseController, dispatchable, Response, routingContext} = require('express-controller');

@routingContext()
class Controller extends BaseController {

    constructor() {

      super();
    }

    // Beware of using the method of the http/request module
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


*Note:* using this decorator means that we will calling the *res.send(_content)* and *res.end()*, so the response session will end there and all middlewares after this action could not interact with the response anymore.



Example 


```js
const {BaseController, dispatchable, responseBody} = require('express-controller');

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

## Funciton library

#### @requestParam(...paramName : string) (works on both method and property)

Assign specific *request.param* to a specific instance (method and property).

Example

Apply to property

```js
class Controller extends BaseControlle {

  @requestParam('userId')
  #id;


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

Apply to method 

```js
class Controller extends BaseControlle {

    @requestParam('userId', 'userName')
    getUserInfo(id, name) {

      // the order of the params is stricted

      console.log(id, name);
    }
}
```


In application


```js
const {routingContext, Endpoint, requestParam, Route} = require('express-controller');

@Route.prefix('/user')
@routingContext()
class Controller extends BaseControlle {

    @requestParam('userId', 'userName')
    getUserInfo(id, name) {

      // the order of the params is stricted

        return {id, name};
    }

    @Endpoint.GET('/:userId/:userName')
    doSomthing() {

        // "this.getUserInfo" here was wrapped in a DecoratorResult object
        // when a method apply decorators (1 at least) of this module.
        // Calling DecoratorResult.resolve() in order to resolve all the impacts that decorators
        // did to the target controller's method
        const {id, name} = this.getUserInfo.resolve();

        console.log(id, name)
    }
}
```


#### @contentType(value : string)
Preset the response 'Content-Type' header, can be overwritten via `this.httpContext.response`

#### @header(name : string, value : string || array)
Preset the response header (using Express's res.setHeader method), the setted headers can be ovetwritten via `this.httpContext.response`

#### @Endpoint decorator
The *@Endpoint* is a "http method" friendly to mapping route. *@Endpoint* just only have the following methods:


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

[MIT](https://github.com/tanhuy998/express-controller/blob/master/LICENSE)

