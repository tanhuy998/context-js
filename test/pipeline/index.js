require('@babel/register')({
    only: [
        /components/,
        /handler/
    ]
})

console.time('init time');

const TransportContext = require('./binding.js');
console.timeEnd('init time');

const pipeline = TransportContext.pipeline;


function random(min, max) {
    return Math.random() * (max - min) + min;
  }

// for (let i = 0; i < 3; ++i) {

//     pipeline.run(new TransportContext());

//     // setTimeout(() => {

//     //     pipeline.run(new TransportContext());
//     // }, random(0, 20000));
// }

const result = pipeline.run(new TransportContext());

result.then((value) => {

    console.log(value);
}).catch((error) => {

    console.log(error);
})
// pipeline.run(new TransportContext());
