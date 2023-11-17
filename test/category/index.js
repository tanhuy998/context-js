const ComponentCategory = require('../../src/dependencies/category/componentCategory');

const obj = new ComponentCategory();

obj.add('test', Object);
obj.add('test', Number);

obj.add('cat', Number);

const a = {};

const match = obj.match(0, 's');



console.log(match);