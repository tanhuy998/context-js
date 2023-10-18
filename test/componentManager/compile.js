"use strict";
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Scope = require('../../src/dependenies/component/scope.js');
var ComponentManager = require('../../src/dependenies/component/componentManager.js');
var components = new ComponentManager();
console.log(ComponentManager);
var A = /*#__PURE__*/_createClass(function A() {
  _classCallCheck(this, A);
  _defineProperty(this, "prop", void 0);
  this.prop = ++this.constructor.count;
});
_defineProperty(A, "count", 0);
components.bindScope(A, A);
components.bind(Scope, Scope);
components.bindSingleton(ComponentManager, ComponentManager);
components.container.setDefaultInstanceFor(ComponentManager, components);
var scope = components.get(Scope);
var obj = components.get(A, scope);
var obj2 = components.get(A);
var obj3 = components.get(A, scope);
console.log(obj.prop); // 1
console.log(obj2.prop); // 2
console.log(obj3.prop); // 1

