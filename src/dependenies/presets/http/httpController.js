const ContextualController = require('../../controller/contextualController.js');
const {outerMetadataExist} = require('reflectype/src/libs/propertyDecorator.js');
const getMetadata = require('../../../libs/getMetadata.js');
const express = require('express');
const HttpContext = require('./httpContext.js');
const { unchangedTextChangeRange } = require('typescript');

/**
 * @typedef {import('./httpMetadata.js').route_t} route_t
 * @typedef {import('./httpContext.js')} HttpContext
 */

function routeHandler(req, res, next) {


}

module.exports = class HttpController extends ContextualController {

    //static #parenRouter;
    static #groups = new Set();


    // /**
    //  *  disposable property
    //  */
    // /**@type {express.Router} */
    // static #router;

    // static get router() {

    //     return this.#router;
    // }

    static #context;


    

    static serve(_context = undefined) {

        this.#context = _context;

        const router = this.#resolveRouter();
        

        return router;
    }

    static #resolveRouter() {

        const router = express.Router();

        
        const metadatas = this.#readMethodRoutes();

        /**@type {Array<route_t>} */
        const routes = metadatas.map(function(meta) {

            return meta.httpRoutes;
        })
    }

    static addGroup(_prefix = '/') {

        if (typeof _prefix !== 'string') {

            return false;
        }

        const groups = this.#groups;

        if (groups.has(_prefix)) {

            return false;
        }

        groups.add(_prefix);

        return true;
    }

    static #mergeWithGroups(_router) {

        if (this.#groups.size === 0) {

            return _router;
        }

        const groupRouter = express.Router();

        for (const prefix of this.#groups) {

            groupRouter.all(prefix, _router);
        }

        return groupRouter;
    }

    static #readParentRoutes() {


    }

    static #readMethodRoutes() {

        const prototype = this.prototype;

// This code snippet filters and maps the own keys of the prototype object. It returns an array of functions from the prototype object that have a metadata object with an array of httpRoutes.
        return Reflect.ownKeys(prototype)
                    .filter(function (name) {

                        const prop = prototype[name];

                        let meta = getMetadata(prototype[name]);

                        return name !== 'constructor' && typeof prop === 'function' && typeof meta === 'object' && Array.isArray(meta?.httpRoutes);
                    })
                    .map(function (methodName) {

                        return getMetadata(prototype[methodName]);
                    });

         
        for (const controllerMethod of prototypeMethods) {

            this.#registerMethodAsHandler(controllerMethod);
        }
    }

    /**
     * 
     * @param {route_t} _route 
     */
    static #registerMethodAsHandler(_controllerMethod) {

        if (typeof _controllerMethod !== 'function') {

            return;
        }

        const meta = getMetadata(_controllerMethod);
        const router = this.#router;

        /**@type {route_t} */
        const routes = meta?.httpRoutes;

        for (const httpVerb in routes || {}) {

            if (typeof router[httpVerb] !== 'function') {

                continue;
            }

            for (const path of httpVerb) {

                router[httpVerb](path, );
            }
        }
    }

    /**@type {httpContext} */
    #httpContext;

    get httpContext() {

        return this.#httpContext;
    }

    constructor(_context) {

        super(_context);

        this.#init();
    }

    #init() {

        this.#httpContext = this.context.getComponent(HttpContext);
    }

    handle() {


    }

    
}

