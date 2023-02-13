"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classStaticPrivateFieldSpecSet(receiver, classConstructor, descriptor, value) { _classCheckPrivateStaticAccess(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor(descriptor, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }
function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }
function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) { _classCheckPrivateStaticAccess(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor(descriptor, "get"); return _classApplyDescriptorGet(receiver, descriptor); }
function _classCheckPrivateStaticFieldDescriptor(descriptor, action) { if (descriptor === undefined) { throw new TypeError("attempted to " + action + " private static field before its declaration"); } }
function _classCheckPrivateStaticAccess(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }
function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }
var D_Context = /*#__PURE__*/function () {
  function D_Context() {
    _classCallCheck(this, D_Context);
  }
  _createClass(D_Context, null, [{
    key: "currentContext",
    get: function get() {
      return _classStaticPrivateFieldSpecGet(this, D_Context, _currentContext);
    }

    // static set currentContext(_value) {

    //     this.#currentContext = _value;
    // }
  }, {
    key: "context",
    get: function get() {
      return _classStaticPrivateFieldSpecGet(this, D_Context, _contextList);
    }
  }, {
    key: "assignContext",
    value: function assignContext(symbol, _constructor) {
      this.context[symbol] = _constructor;
    } /////////////////////////
  }, {
    key: "defineContext",
    value: function defineContext(symbol) {
      //const symbol = Symbol(key);

      _classStaticPrivateFieldSpecSet(this, D_Context, _currentContext, symbol);
      this.context[symbol] = 1;

      //Route.currentContext
    } ////////////////////////
  }]);
  return D_Context;
}();
var _contextList = {
  writable: true,
  value: {}
};
var _callbackQueue = {
  writable: true,
  value: []
};
var _currentContext = {
  writable: true,
  value: void 0
};
function inheritDecoratorContextClass(_extendClass) {
  Object.setPrototypeOf(_extendClass, D_Context);
  return _extendClass;
}
module.exports = inheritDecoratorContextClass;

