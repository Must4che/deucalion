'use strict';

module.exports = {
    port: 8888,
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
