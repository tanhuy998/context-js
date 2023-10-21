require('@babel/register')({
    only: [
        /components/,
        /handler/
    ]
})

const A = require('./handler/A.js');
const B = require('./handler/B.js');

const CustomContext = require('./binding.js');


function first() {
    console.log('----------------------')
    console.log('first phase');
}


const pipeline = CustomContext.pipeline;

;

pipeline.addPhase().setHandler(first).build();
pipeline.addPhase().setHandler(A).build();
pipeline.addPhase().setHandler(B).build();

pipeline.run(new CustomContext());
pipeline.run(new CustomContext());
pipeline.run(new CustomContext());
