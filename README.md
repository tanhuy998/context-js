
# Express Controller
A Controller class for handling things in Express inspired by coding style of ASP.NET and Java Spring.




## Features

- Support routing and register middleware in controller definition context using js decorator
- Binding http context (such as request, response and next objects).


## Usage



This project use [@babel/plugin-decorator-proposal](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) to transplile [decorator](https://github.com/tc39/proposal-decorators) syntax for javascript which will soon be available.




Define the controller class



```js
const {BaseController, dispatchable} = require('express-controller');

@dispatchable
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



use with express:



```js
const app = require('express')();
const {dispatch} = require('express-controller');

const Controller = require('the/Controller/dir');

app.get('/path', dispatch(...Controller.proxy.sendSomething));
```
or 
```javascript
app.get('/path', dispatch(Controller, 'sendSonthing'));
```



#### Routing in class definition context
firstly do the code:
```javascript
const express = require('express');
const {RouteContext} = require('express-controller');

RouteContext.init(express);

const Controller = require('the/Controller/dir');

const app = express();
app.use('/', RouteContext.resolve());
```




in class definition:




```js
const {Route, BaseController, dispatchable, routingContext} = require('express-controller');

/*
* use routingContext() decorator to annotate that this class
* is mapping routes inside.
* routingContext() must be placed before all routing decorators 
* that affects on class.
*/
@routingContext()
@dispatchable
class Controller extends BaseController {

    constructor() {

      super();
    }

    @Route.get('/send')
    sendSomthing() {


    }
}

```



## Use prefix 


syntax:



```js
@Route.prefix('/example')
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
@routingContext()  // routingContext() is placed before Route.prefix()
@dispatchable
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
@dispatchable
class Controller extends BaseController {

    constructor() {

      super();
    }

    // the current route path will be 'get /multiple/send'
    @Route.get('/send')
    sendSomthing() {


    }
}
```

## Middleware for routes


syntax



```js
// Invokes before the controller's action do the things.
@Middleware.before(...theMiddlewareIntances)

// invokes before the controller's action.
@Middleware.after(...theMiddlewareIntances)

```


example



```js
const {Route, BaseController, dispatchable, Middleware} = require('express-controller');

const bodyParser = require('body-parser');

function log(req, res, next()) {

  console.log(res);
  next();
}

@routingContext()
@dispatchable
class Controller extends BaseController {

    constructor() {

      super();
    }

    @Middleware.before(bodyParser.json())
    sendSomthing() {

      const req_body = this.httpContext.request.body;

    }

    @Middleware.after(log)
    mistake() {

      // *beware that when setting middleware after a controller's action
      // we must call next() to delegate next middleware
      this.httpContext.next();
    }
}


```



## Response reference decorator

The @Response decorator represent the current httpContext.response of current response context. We can invoke all the method of the "response" object.

syntax:

```js
@Response.method(...args)
```



example



```js

const {Route, BaseController, dispatchable, Response} = require('express-controller');


@dispatchable
class Controller extends BaseController {

    constructor() {

      super();
    }

   
    @Response.writeHead(200, {
      'Content-Type': 'text/plain',
    })
    sendSomthing() {

      const req_body = this.httpContext.request.body;
    }
}

```



## Controller that return response Content


We can annotate the return value of controller's action will be sent as the body of the response.

syntax:


```js
@responseBody
```


example 


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
      // this.httpContext.response.write('Hello World!')

       return 'Hello World!';
    }
}
```


## Authors

- [@tanhuy998](https://www.github.com/tanhuy998)


## License

[MIT](https://choosealicense.com/licenses/mit/)

