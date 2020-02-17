'use strict';

module.exports = {
    port: 7788,
    metrics: {
        name: 'node',
        dbStatus: false,
        kafkaStatus: false
    },
    package: null,
    route: {
        method: 'GET',
        url: '/metrics',
        handler: null
    }
};
