function isPipeline(_unknown) {

    if (typeof _unknown !== 'object') {

        return false;
    }

    const pipe = _unknown.pipe;
    const run = _unknown.run;

    if (typeof pipe === 'function' && typeof run === 'function') {

        return true;
    }

    return false;
}

module.exports = isPipeline;