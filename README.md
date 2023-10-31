
# Context-JS


### General purpose context


## Acknowledgment

This package was built while the `TC39-proposal-decorator` was in progress, so there may be changes to the proposal for Javascript's decorator in the future. At the time of constructing this package, I used Babel 7 with plugin `plugin-proposal-decorators` version `2022-03`, which is the implementation for the early stage 3 of the TC39-proposal-decorator. Up to now, the stage 3 proposal has undergone many changes, but these have not had a significant impact. This will remain the case until either the release of Babel 8 or the approval of the decorator proposal to Javascript world.


### Installation

npm:

```bash
npm install @tanhuy998/context-js
```

#### Configuration 


**.babelrc or babel.config.json**

```js
{
  "presets": [
        "@babel/preset-env"
    ],
  "plugins": [["@babel/plugin-proposal-decorators", { "version": "2022-03" }]]
}
```

## Usage

Here is a simple example of using Context-js

```javascript
const Context = require('@tanhuy998/context-js/context');
const {ContextHandler} = require('@tanhuy998/context-js/handler');
const {autowired} = require('@tanhuy998/context-js/decorator');
const {paramsType} = require('reflectype/decorator');

class Component {

  static count = 0;

  id = ++this.constructor.count;
}

class CustomHandler extends ContextHandler {

  // dependency injection
  // the pipeline will call the handle method 
  @autowired
  @paramsType(Component) 
  handle(_comp) {

    console.log(_comp.id);
  }
}

// define a context class, this's called Isolation of context
class CustomContext extends Context {

  static {

    this.__init();

    this.components.bind(Component);

    // add phase to pipeline
    this.pipeline.addPhase().setHandler(CustomHandler).build();
  }
}

const customContextPipeline = CustomContext.pipeline;

for (let i = 0; i < 5; ++i) {

  customContextPipeline.run(new CustomContext());
}

/** output
 * 1
 * 2
 * 3
 * 4
 * 5
*/
```

This is just codes that print from 1 to 5 every single line to the console. Nevertheless, the example gives an overview of Context-js 's features.
 
## Key concepts

Context-js implements the following concepts:

  + **Isolation of contexts**
  + **Pipeline of handling**
  + **Dependency Injection**

## Isolation of contexts

With Context-js, we define context classes for handling particular actions in contextual ways. Context classes is classes that inherit the base class `Context` that can be imported from '@tanhuy998/context-js/context' path. 

the `Context` class is considered as super class (also known as abstract class in Java and PHP). This is the definition of the class.

```javascript
class Context {

    static componentManager: ComponentManager;

    static pipeline: Pipeline;

    static items: ItemsManager;

    static DI_System : DependenciesInjectionSystem;

    static get DI() {

        return this.DI_System;
    }

    static get components() {

        return this.componentManager;
    }



    #scope: Scope;

    #session: ItemsManager;

    get session() {

        return this.#session;
    }

    get global() {

        return this.constructor;
    }

    get scope() {

        return this.#scope;
    }
}
```

when extending the `Context`, we call the static method `__init()` to initialize static fields.

```javascript
class CustomContext extends Context {

  static {

    this.__init();

    /**
     *  
     */
    this.components.bind(Component);

    this.pipeline.addPhase().setHandler(CustomHandler).build();
  }
}
```
A more realistic illustation

```javascript
const Context = require('@tanhuy998/context-js/context');
const {autowired} = require('@tanhuy998/context-js/decorator');
const {paramsType, implement} = require('reflectype/decorator');
const {Interface} = require('reflectype/interface');

// define IGettable interface by reflectype package
class IGettable extends Interface {

  get() {

  }
}

@implement(IGettable)
class UserRepository {

  /**
   * this class is just an illustration
   */
  #dbConnection 

  get(id) {

    return this.#dbConnection.get('user').getById(id);
  }
}

class HttpHandler extends ContextHandler {

  @autowired
  @paramsType(IGettable)
  async handle(_db) {

    const user = await _db.get(1);
  }
}

class HttpContext extends Context {

  static {
    this.__init();

    this.componets.bindScope(IGettable, UserRepository);


    this.pipeline.addPhase().setHandler(HttpHandler);
  }

  #request;

  constructor(_req) {

    this.#request = _req;
  }
}

/**
 *  this is an express handle function
 */
async function incommingRequest(req, res, next) {

  const pipeline = HttpRequestContext.pipeline;

  const httpContext = new HttpContext(req);

  try {

    await pipeline.run(httpContext);

    next();
  }
  catch(err) {

    next(err);
  }
}

const app = require('express')();

app.use(incomingRequest);
```

The example is simple express handler, the example define a HttpContext binding interface IGettable as UserRepository class, handles for every incomming http request which dispatched by the Express app by using the HttpHandler. 


## Pipeline of handling


Context-js defines the `Pipeline` class which is used to handle a particular context. A pipeline is a sequence of actions. Each action is called `Phase`. When a pipeline is requested to handle a context, It dispatches the context phase by phase to handle and then resolve or reject the result back.

Context classes has their own default pipeline. The default pipeline of a particular context class especially just only run context object of their bound context class. Oppositely, pipelines that is not bound with a context class is context-free pipeline.

### Context handler

A pipeline phase's handler can be either a function, ES6 classes, or concrete classes of 'Contexthandler'. Any ES6 classes can be a phase handler if there exist the `handle()` method in their prototype. Functions is not treated as class even though their prototype has the `hadnle()` method.

Like `Context` class, `ContextHandler` is determined as abstract class.

#### Define handler

Extend ContextHandler
```javascript
const ContextHandler = require('@tanhuy998/context-js/handler');

class CustomHandler extends ContextHandler {

  handle() {

    const lassvalue = this.lastValue;
    const context = this.context;

    console.log('this is a custom handler');
  }
}
```
ES6 class

```javascript
class handler {

  /** 
   *  if there is no metadata about parameters here, this method would be treated like function handler and arguments are passed as the following pattern.
   * 
   * @param {any} lastValue the value returned by the previous handler.
   * @param {Context} context the context which is the pipeline handles.
   * @param {Payload} payload the payload of the current handling activity.
   * 
   * @return {any} the value intended to be passed to the next handlers. if the current handler is the last, the returned value is the resolved value for the promise return by Pipeline.run(context).
   * 
   */
  handler() {

    /** 
     *  the following properties do not exist 
     * 
     *  const lassvalue = this.lastValue;
     *  const context = this.context;
     */

    console.log('this is an ES6 handler');
  }
}
```

Function

```javascript
/**
 * @param {any} lastValue the value returned by the previous handler.
 * @param {Context} context the context which is the pipeline handles.
 * @param {Payload} payload the payload of the current handling activity.
 * 
 * @return {any} the value intended to be passed to the next handlers. if the current handler is the last, the returned value is the resolved value for the promise return by Pipeline.run(context).
 */
function handle(lastValue, context, payload) {

  console.log('this ')
}
```

#### Differences between ContextHandler, ES6 classes and functions in handling context

ContextHandler is regular way of handling contexts. Inside the context of ContextHandler, we could get information about the `Context` object. With `ContextHandler`, all methods is fully injected if they have metadata (excepts private methods).

```javascript
const ContextHandler = require('@tanhuy998/context-js/handler');
const {autowired} = require('@tanhuy998/context-js/decorator');
const {paramsType} = require('reflectype/decorator');


class CustomHandler extends ContextHandler {


  handle() {

    /**
     * getRequestHeaders() is injected.
     */
    console.log(this.getRequestHeaders());
  }

  @autowired
  @paramsType(Request)
  getRequestHeaders(_req) {

    return _req.header;
  }
}
```

ES6 class is just a way to to apply dependency injection to `handle()` method. furthermore, ES6 class handler doesn't carry information about the context.


### Define Pipeline phases


```javascript
pipeline.addPhase().setHandler(handler: Function|ContextHandler).build()
```

### Handle a context

```javascript
pipeline.run(contextObject: Context) : Promise<any>
```


example

```javascript
const Pipeline = require('@tanhuy998/context-js/pipeline');
const Context = require('@tanhuy998/context-js/context');

class MartiniRequestContext extends Context {

  static {

    this._init();
  }

  #note;
  
  get note() {

    return this.#note;
  }

  constructor(_note) {

    this.#note = _note;
  }
}

const martiniMaking = new Pipeline();

function prepare() {

  return [];
}

function addGin(currentMixture) {

  currentMixture.push('2 1/2 ounces gin')

  return currentMixture;
}

function addDryVermouth(currentMixture) {

  currentMixture.push('1/2 ounce dry vermouth')

   return currentMixture;
}

function shake(currentMixture) {

  currentMixture.push('put ice and shake')

   return currentMixture;
}

function putOlives(currentMixture) {

  currentMixture.push('olives')

   return currentMixture;
}

martiniMaking.addPhase().setHandler(prepare).build();
martiniMaking.addPhase().setHandler(addGin).build();
martiniMaking.addPhase().setHandler(addDryVermouth).build();
martiniMaking.addPhase().setHandler(shake).build();
martiniMaking.addPhase().setHandler(putOlives).build();

const martiniGlass = await martiniMaking.run(new MartiniRequestContext());

console.log(maritniGlass);

/**
 * output
 *  [ 
 *    '2 1/2 ounces gin',
 *    '1/2 ounce dry vermouth',
 *    'put ice and shake',
 *    'olives'
 *  ]
 */

```

### Handling pipeline error

The above example shows how to make a Martini glass step by step (phase by phase). Let's consider, what happens if the customer prefer a lemon peel twist than olives for garnish. That is the problem and the solution here is pipeline error handler.

Error handler can be either a function or a concrete class of type `ErrorHandler`. `ErrorHandler` is subclass of `Contexthandler` in addition to the three methods `dismiss()`, `abort()` and `rollback()`.

When a pipeline start handling a context object, whenever a phase of the pipeline causes an error, It is now regconized as a breakpoint, then the pipeline controller traces and reports the error back to the pipeline, the pipeline then dispatches the error to an ErrorController, from now on, the pipeline controller and the error controller directly interacting with each other.


### Redirection of error handling

Pipeline controller and error controller communicate with each other by sending signals. There are three signals DISMISS, ABORT and ROLLBACK, sending these signals is called redirection. The error controller send redirect signal to the pipeline controller, letting the pipeline controller make decision.

Meaning of the signals:
 + DISMISS: tells the pipeline controller that just skipping the breakpoint and operate next phase.
 + ROLLBACK: rollback the handling point to the breakpoint for it to operates again, this signal mostly causes infinite loop if we are not able to find out the point of failure.
 + ABORT: aborting the whole pipeline progression.

`ABORT` signal would cause the rejection of the promise returned by `Pipeline.run(context)`. The rejected value is the `Breakpoint` object that trace the whole progress from the beginning of the pipeline to the whole error handling progress.

If error handling pipeline has no redirection back to the context pipeline, the same result as `ABORT` occurs.

```javascript
const {ErrorHandler} = require('@tanhuy998/context-js/handler');

class CustomErrorHandler extends ErrorHandler {

  handle() {

    const breakpoint = this.breakpoint;
    const context = this.context;

    const originError = this.orriginError;
    const currentError = this.error;

    /**
     * this.dismiss();
     * this.abort();
     * this.rollback();
     */
  }
}
```
define a function error handler

```javascript
/**
 * @param {any} error the returned error of the previous error handler or the original error caused by the pipeline breakpoint if this handler is the first reigstered.
 * @param {Context} context the context which is the pipeline handles
 * @param {Breakpoint} breakpoint the break point of the pipeline
 * @param {Function} next the function for making decision
 * 
 * Optional parameters
 * @param {Function} next.dismiss
 * @param {Function} next.abort
 * @param {Function} next.rollback
 * 
 * @return {any} the value intended to be passed to the next error handlers. if the current handler is the last, the returned value is resolved for the promise return by Pipeline.run(context). If returned value is redirect signal, the current error handling pipeline ends here, let flow back to the context pipeline.
 * @throws {any} like @return
 */
function handleError(error, context, breakpoint, next) {

  const {dismiss, abort, rollback} = next;

  const originError = breakpoint.originError;
}
```

*Note for error handling*: returned values or thrown errors will be analized by the error controller, if the values (either values or errors) is not a redirect signal, they typically be considered as errors and then passed to the next error phase. We can neither throw, return nor use the 'next' function.

### Register error handlers 

```javascript
pipeline.onError(...handler: Function|ErrorHandler) : undefined
```

```javascript

class CustomErrorHandler extends ErrorHandler {

  handle() {


  }
}

function handleError(error, context, breakpoint, next) {


}

pipeline.onError(CustomErrorHandler, handlerError);
```

### Getting back to the problem

What happens when the customer wants a twisted lemon peel for garnish even though our recipe just only decorates the glass with olives.

We create an 'exception' for this kind of customer without changing our original recipe by using pipeline error handler. (The bartender would say that: "Oh I forgot your note, let me replace the olives with twisted lemon peel").

```javascript
class NotOlivesForGarnish extends Error {


}

/**
 * parameters explaination
 * 
 * @param {Array} 
 * @param {MartiniRequestContext}
 */
function putOlives(currentMixture, request) {

  const customerNote = request.note;

  if (request.note?.garnish === 'twisted lemon peel') {

    throw new NotOlivesForGarnish();
  }

  currentMixture.push('olives')

   return currentMixture;
}

/**
 * parameters explaination
 * 
 * @param {Error} 
 * @param {MartiniRequestContext}
 * @param {Breakpoint}
 * @param {Function}
 */
function replaceOlivesWithLemonPeel(error, request, breackpoint, next) {

  if (error instanceof NotOlivesForGarnish) {

    const rollbackPayload = breakpoint.rollbackPayload;

    const currentGlass = rollbackPayload.last;

    currenGlass.push('twisted lemon peel');

    next.dismiss();
  }
  else {

    next(error);
  }
}
```

As shown above, we check the customer's note if whose garnish option is 'twisted lemon peel' then throw new `NotOlivesForGarnish`. The error controller now then be activated and operates the error handling pipeline. The `replaceOlivesWithLemonPeel` is invoked and decorates the Martini glass with lemon peeel.

#### Wrap the things up

define context

```javascript
class MartiniRequestContext extends Context {

  static {

    this._init();
  }

  #note;
  
  get note() {

    return this.#note;
  }

  constructor(_note) {

    this.#note = _note;
  }
}
```

define handlers 

```javascript
class NotOlivesForGarnish extends Error {


}

function prepare() {

  return [];
}

function addGin(currentMixture) {

  currentMixture.push('2 1/2 ounces gin')

  return currentMixture;
}

function addDryVermouth(currentMixture) {

  currentMixture.push('1/2 ounce dry vermouth')

   return currentMixture;
}

function shake(currentMixture) {

  currentMixture.push('put ice and shake')

   return currentMixture;
}


function putOlives(currentMixture, context) {

  const garnish = context.note?.garnish;

  if (garnish === 'twisted lemon peel') {

    throw new NotOlivesForGarnish();
  }

  currentMixture.push('olives')

   return currentMixture;
}
```

define error handler

```javascript
const {DISMISS} = require('@tanhuy998/context-js/constants');

function replaceOlivesWithLemonPeel(error, context, breackpoint, next) {

  if (error instanceof NotOlivesForGarnish) {

    const rollbackPayload = breakpoint.rollbackPayload;

    const currentGlass = rollbackPayload.last;

    currenGlass.push('twisted lemon peel');

    // dismiss the breakpoint that is the 'putOlives' phase
    next.dismiss();

    /**
     * alternative ways
     *  throw DISMISS; or return DISMISS;
     */
  }
  else {

    next(error);
  }
}
```

Initiate pipeline

```javascript
const Pipeline = require('@tanhuy998/context-js/pipeline');

const martiniMaking = new Pipeline();

martiniMaking.addPhase().setHandler(prepare).build();
martiniMaking.addPhase().setHandler(addGin).build();
martiniMaking.addPhase().setHandler(addDryVermouth).build();
martiniMaking.addPhase().setHandler(shake).build();
martiniMaking.addPhase().setHandler(putOlives).build();

martiniMaking.onError(replaceOlivesWithLemonPeel);

```

```javascript
async function orderTwoMartiniGlasses() {

  const firstRequest = new MartiniRequestContext();

  const note = {
    garnish: 'twisted lemon peel'
  }

  const secondRequest = new MartiniRequestContext(note);

  const firstGlass = await martiniMaking.run(firstRequest);
  const secondGlass = await martiniMaking.run(secondRequest);


  console.log('First glass', firstGlass);
  console.log('Second glass', secondGlass);
}
```

finally make some Martini requests

```javascript
orderTwoMartiniGlasses();

/**
 * outputs
 * 
 *  First glass [ 
 *    '2 1/2 ounces gin',
 *    '1/2 ounce dry vermouth',
 *    'put ice and shake',
 *    'olives'
 *  ]
 *  Second glass [ 
 *    '2 1/2 ounces gin',
 *    '1/2 ounce dry vermouth',
 *    'put ice and shake',
 *    'twisted lemon peel'
 *  ]
 */
```

This is the implementation for serving two kind of decorations of a Martini glass, one for our regular(prefered) recipe and one for the customer prefers.

That's not enough. In reality, there is a variety of Martini combination. More than just option for garnish such as vodka instead of gin, Noilly Prat or Dolin for Dry Vermouth, stirred instead of shaken (when the customer is not on mission). There are lots of things to handle to improve our service in order to satisfy our customers. 


## Dependency Injection


This package provides Dependency Injection by using an ioc container to help Javascript users on wiring dependencies across components. Dependency Injection in this package just support two types of injection is Constructor Injection and Property Injection.
Borrowing mostly the concept Dependency Injection of ASP.NET and Laravel's Service Container, Components has it's own lifecycle depends on which type they are bound.


## Binding components

Binding components is the prerequisite operation of dependency injection. That makes the Dependency Inversion concept meaningful. Binding means telling the Ioc Container which component (concrete) should be injected as abstraction (base classes or interfaces). There exists relationships between abstracts and concretes (as-is/can-do)

There are three types of binding components (also called as component's lifecycle)

 - Singleton: the component lives in the whole context (appication), and theres no others.
  - Scope: the component lives only in a particular scope, there's no the same unless outside its scope.
  - Transient: components live anywhere even though which context it stand.

When a singleton is initiated, It's dependencies are also singleton or transient component. 

When a transient component is initiated, It's dependencies could be transient, singleton or scope component depends on the context that the transient component is initiated. If transient compoent is initiated without a "scope", It's dependencies are singleton and transient. Otherwise, the dependencies would be both singleton, scope and transient. 

About scope component. Like transient, It's dependencies are the same. There's just a difference on it life's cycle. If a scope component is initiated without scope, It would be treated like a transient component and otherwise in "scope".

```js

// bind singleton
ApplicationContext.components.bindSingleton(abstract, concrete);

// bind scope
ApplicationContext.components.bindScope(abstract, concrete);

// bind transient
ApplicationContext.components.bind(abstract, concrete);

// abstract and concrete are classes or functions. The concrete must inherits the abstract. 
```



## Injecting dependencies

The two rules of dependencise injection in this package is:

  + The dependency (instance of a class) must be registered to to iocContainer before another dependencies (instances) needs (initiation) it.
  + Dependency Injection just work when the component's dependency's type well-defined (also have alternative way).

Thanks to package "reflectype" (also my own package :haha) that contributes a method to set metadata to classes and objects.

Based on the fundamental of "Isolation of contexts". Instances of a particular class are initiated differently depend on the context that initiates them.

```javascript
const {Interface} = require('reflectype/interface');
const {implement} = require('reflectype');

const {autowired} = require('@tanhuy998/context-js/decorator');

class IDatabase extends Interface {

  connect() {

  }

  query() {


  }
}

@implement(IDatabase)
class MysqlEngine {

  connect() {

  }

  query() {


  }
}

@implement(IDatabase)
class MongoDBEngine {

  connect() {

  }

  query() {


  }
}

class UserRepository {

  @autowired
  @type(IDatabase)
  accessor dbConnection
} 
```


```javascript
const Context = require('@tanhuy998/context-js/context');

class ContextA extends Context {

  static {
    
    this.__init();

    this.componens.bind(IDatabase, MysqlEngine);
    this.componens.bind(UserRepository);
  }
}

class ContextB extends Context {

  static {
    
    this.__init();

    this.componens.bind(IDatabase, MongoDBEngine);
    this.componens.bind(UserRepository);
  }
}
```

```javascript
const firstRepo = ContextA.componens.get(UserRepository);
const secondRepo = ContextB.componens.get(UserRepository);

console.log(firstRepo.dbConnection.constructor);
console.log(secondRepo.dbConnection.constructor);

/**
 * outputs
 * 
 * [class MysqlEngine]
 * [class MongoDBEngine]
 */
```

As we can see, the `UserRepository` defines a field `dbConnnection` that is type-hinted as an instance of type that implements the `IDatabase` interface. When requesting a `UserRepository` instance from both ContextA and Context B, we receive an object that has the field `dbConnnection` type is `MySqlEngine` and `MongoDBEngine` respectively.

## Dependency injection types

There two type of injection that context-js inplements.

### Constructor Injection (pseudo constructor)

use constant macro `CONSTRUCTOR` to define a pseudo constructor to let the instance's dependencies injected by the iocContainer.

Make sure the base's contructor can invoke properly without arguments;

```js
const {CONSTRUCTOR} = require('@tanhuy998/context-js/constants');
const {autowired} = reuqire('@tanhuy998/context-js/decorator');
const {paramsType} = requie('reflectype');


class ComponentA {}


class Controller extends HttpController {
    
    prop;
  
  @autowired
  paramsType(ComponentA)
  [CONSTRUCTOR](component) {

    this.prop = component
  }
}
```


### Property injection

Applying `@autowired` to the class annotated with `@autobind` to inject the "equivalent" component. 

This method only works on auto-accessor field, add keyword "accessor" before the field, then apply `@type` to that field in order to determine the type of the field is and then apply `@autowired` to tell the iocContainer that this field need to be injected.

```js
const {autowired} = require('@tanhuy998/context-js/decorator');
const {type} = require('reflectype');

class ComponentA {}

class Controller extends HttpController {

  @autowired
  @type(ComponentA)
  accessor prop;

}

```

### Injection behavior 

When the two Dependencies Injection methods coexist, they act like a normal Object instantantiation. Fields are evaluated just before constructor is called.

```js
const {CONSTRUCTOR} = require('@tanhuy998/context-js/constant');
const {autowired} = require('@tanhuy998/context-js/decorator');

const {paramsType, type} = requie('reflectype');


class ComponentA {

  static count = 0;

  id;

  constructor() {

    this.id = ++this.constructor.count;
  }
}


class Controller extends HttpController {
  
  @autowired
  @type(ComponentA)
  accessor prop;
  
  @autowired
  paramsType(ComponentA)
  [CONSTRUCTOR](component) {

    this.print();
    this.prop = component;
  }

  print() {

    console.log(this.prop.id);
  }
}

ApplicationContext.components.bind(Controller);

const obj = ApplicationContext.components.get(Controller);

obj.print();

/**
 * output
 * 
 * 1
 * 2
 */

```

the output of the print() method is 2 (in number). Because fields are primarily injected. After that, pseudo constructor is called by the iocContainer.

An important point to note, the progression of how ioc Container inititating a component

```
  instance := new Class();
  inject -> instance[fields];
  inject -> instance[pseudo constructor];
```



another note:

Abstracts and conscretes 's static field also be injected when they are register to iocContainer (except interfaces).


## Author

- [Huy Tran](https://www.github.com/tanhuy998)


## License

[MIT](https://github.com/tanhuy998/context-js/blob/master/LICENSE)

