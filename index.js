'use strict';

const { getSummary, getContentType } = require('./lib/helper');
const metrics = require('./lib/custom');
const plugin = require('./lib/plugin');
const route = require('./lib/route');
const server = require('./lib/server');

module.exports = {
    metrics,
    plugin,
    route,
    server,
    getSummary: getSummary(),
    getContentType: getContentType()
};
