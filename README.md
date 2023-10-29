
# Context-JS


### General purpose context


## Acknowledgment

This package was built while the `TC39-proposal-decorator` was in progress, so there may be changes to the proposal for Javascript's decorator in the future. At the time of constructing this package, I used Babel 7 with the `plugin-proposal-decorators` version `2022-03`, which is the implementation for the early stage 3 of the TC39-proposal-decorator. Up to now, the stage 3 proposal has undergone many changes, but these have not had a significant impact. This will remain the case until either the release of Babel 8 or the approval of the decorator proposal.


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

## Key concepts

Context-js implements the following concepts:

  + **Isolation of contexts**
  + **Pipeline of handling**
  + **Dependency Injection**

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

class CutomeHandler extends ContextHandler {

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


## Isolation of contexts

the `Context` is considered a super classe (also known as abstract class in Java and PHP). This is the definition of the class.

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

when extending the `Context`, we call the static methid `__init()` to initialize the above fields.

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

class IGettabel extends Interface {

  get() {

  }
}

@implement(IGettable)
class MySqlEngine {

  #dbConnection 

  get(id) {

    return this.#dbConnection.getById(id);
  }
}

class DataBaseOperationContext extends Context {

  static {
    this.__init();

    this.componets.bindScope(IGettable, MySqlEngine);
  }
}
```

## Pipeline of handling


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

The two rules of dependencise injection in this package is:

  + The dependency (instance of a class) must be registered to to iocContainer before another dependencies (instances) needs (initiation) it.
  + Dependency Injection just work when the component's dependency's type well-defined (also have alternative way).

Thanks to package "reflectype" (also my own package :haha) that contributes a method to redefine metadatas of classes and objects. therefore, Dependency Injection in Javascript can become more complex than it should be.

### Constructor Injection (pseudo constructor)

use constant macro `CONSTRUCTOR` to define a pseudo constructor to let the instance's dependencies injected by the iocContainer.

Make sure the base's contructor can invoke properly without arguments;

```js
const {autoBind, HttpController, CONSTRUCTOR, autowired} = require('@tanhuy998/context-js')

const {paramsType} = requie('reflectype');

@autoBind()
class ComponentA {}

@autoBind()
class Controller extends HttpController {
    
    prop;
  
  @autowired
  paramsType(ComponentA)
  [CONSTRUCTOR](component) {

    this.prop = component
  }
}

```

Inject components to endpoint's handler

```js
const {autoBind, BaseController, routingContext, Endpoint} = require('@tanhuy998/context-js')
const {HttpController, CONSTRUCTOR, autowired} = require('@tanhuy998/context-js')

const {paramsType} = requie('reflectype');

@autoBind()
class ComponentA {

  message = 'Hello World';
}

@routingContext()
@autoBind()
class Controller extends HttpController {
    
    prop;
    
    // inject a instance of ComponentA to the parameter
  constructor(component = ComponentA) {
    super();
    
    this.prop = component;
  }

  @autowired
  @Endpoint.GET('/')
  @paramsType(ComponentA)
  index(_component) {

    console.log(component.message);
  }
}

```


### Property injection

Applying `@autowired` to the class annotated with `@autobind` to inject the "equivalent" component. 

This method only works on auto-accessor field, add keyword "accessor" before the field, then apply `@type` to that field in order to determine the type of the field is and then apply `@autowired` to tell the iocContainer that this field need to be injected.

```js
const {autoBind, is, BaseController} = require('@tanhuy998/context-js')
const {HttpController, CONSTRUCTOR, paramsType, autowired} = require('@tanhuy998/context-js')

const {type} = require('reflectype');

@autoBind()
class ComponentA {}

@autoBind()
class Controller extends HttpController {

  @autowired
  @type(ComponentA)
  accessor prop;

  constructor() {

    super();
  }
}

```

### Injection behavior 

When the two Dependencies Injection methods coexist, they act like a normal Object instantantiation. Fields are evaluated just before constructor is called.

```js
const {autoBind, HttpController, CONSTRUCTOR, autowired} = require('@tanhuy998/context-js')

const {paramsType, type} = requie('reflectype');

@autoBind()
class ComponentA {

  static count = 0;

  id;

  constructor() {

    this.id = ++this.constructor.count;
  }
}

@autoBind()
class Controller extends HttpController {
  
  @autowired
  @type(ComponentA)
  accessor prop;
  
  @autowired
  paramsType(ComponentA)
  [CONSTRUCTOR](component) {

    this.prop = component
  }

  print() {

    console.log(this.prop.id);
  }
}

```

the output of the print() method is 2 (in number). Because fields are primarily injected. After that, pseudo constructor is called by the iocContainer.

An important point to note, the progression of how ioc Container inititating a component

```
  instance := new Class();
  inject -> instance[fields];
  inject -> instanstance[pseudo constructor];
```



another note:

Abstracts and conscretes 's static field also be injected when they are register to iocContainer (except interfaces).


## Author

- [Huy Tran](https://www.github.com/tanhuy998)


## License

[MIT](https://github.com/tanhuy998/context-js/blob/master/LICENSE)

