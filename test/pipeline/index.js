require('@babel/register')({
    only: [
        './handlerA.js',
        './handlerB.js'
    ]
})

const A = require('./A.js');
const B = require('./B.js');

const Context = require('../../src/dependenies/context/context.js');

const Pipeline = require('../../src/dependenies/pipeline/pipeline.js');

function first() {

    console.log('first phase');
}


const pipeline = new Pipeline();

const context = new Context();

pipeline.addPhase().setHandler(first).build();
pipeline.addPhase().setHandler(A).build();
pipeline.addPhase().setHandler(B).build();

pipeline.run(context)

