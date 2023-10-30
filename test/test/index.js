
function doSomthing() {


}

function loop(max) {

    let i = 0;

    setImmediate(function callAgain() {

        doSomthing();

        if (++i < max) {

            setImmediate(callAgain);
        }
    })
}