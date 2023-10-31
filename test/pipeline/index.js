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

// function run() {

//     const arr = [];

//     for(let i = 0; i < 1000; ++i) {

//         const result =  pipeline.run(new TransportContext());

//         arr.push(result);
//     }

//     return arr;
// }

// const results = run();

// console.log(results);

// Promise.allSettled(results).then(resolve => {
//     console.log(1);
//     console.log(resolve);
// }).catch(rejected => {

//     for (const br of rejected) {

//         console.log(br);
//     }
// })

pipeline.run(new TransportContext());
