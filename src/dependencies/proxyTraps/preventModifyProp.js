module.exports = {
    set: function (target) {

        throw new Error(`reassigning property of [${target?.name}] is not allowed`);
    }
}