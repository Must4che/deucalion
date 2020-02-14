'use strict';

const util = require('../util');
const defaultMetricsConfig = require('../config').metrics;

const getMetrics = (prefix) => {
    const { dbStatus, kafkaStatus } = defaultMetricsConfig;
    const basicMetrics = [
        {
            name: `${prefix}_metrics_request_counter`,
            metricType: 'Counter',
            help: 'Counts number of requests for /metrics endpoint',
            labelNames: ['metrics']
        },
        {
            name: `${prefix}_request_counter`,
            metricType: 'Counter',
            help: 'Counts number of REST requests',
            labelNames: ['service']
        },
        {
            name: `${prefix}_produce_counter`,
            metricType: 'Counter',
            help: 'Counts number of produced kafka events',
            labelNames: ['produce']
        },
        {
            name: `${prefix}_consume_counter`,
            metricType: 'Counter',
            help: 'Counts number of consumed kafka events',
            labelNames: ['consume']
        },
        {
            name: `${prefix}_response_time`,
            metricType: 'Histogram',
            help: 'Counts response time of a service',
            labelNames: ['service'],
            buckets: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]
        },
        {
            name: `${prefix}_produce_response_time`,
            metricType: 'Histogram',
            help: 'Counts response time of an produced kafka event',
            labelNames: ['produce'],
            buckets: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]
        },
        {
            name: `${prefix}_consume_response_time`,
            metricType: 'Histogram',
            help: 'Counts response time of an consumed kafka event',
            labelNames: ['consume'],
            buckets: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]
        }
    ];
    const dbStatusGauges = {
        name: `${prefix}_database_status`,
        metricType: 'Gauge',
        help: 'Shows database status',
        labelNames: ['db']
    };
    const kafkaStatusGauge = {
        name: `${prefix}_kafka_status`,
        metricType: 'Gauge',
        help: 'Shows Kafka status',
        labelNames: ['kafka']
    };
    if (dbStatus) basicMetrics.push(dbStatusGauges);
    if (kafkaStatus) basicMetrics.push(kafkaStatusGauge);
    return basicMetrics;
};
/*
  .----------------.  .----------------.  .----------------.  .----------------.  .----------------. 
 | .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
 | |     ______   | || |   _____      | || |      __      | || |    _______   | || |    _______   | |
 | |   .' ___  |  | || |  |_   _|     | || |     /  \     | || |   /  ___  |  | || |   /  ___  |  | |
 | |  / .'   \_|  | || |    | |       | || |    / /\ \    | || |  |  (__ \_|  | || |  |  (__ \_|  | |
 | |  | |         | || |    | |   _   | || |   / ____ \   | || |   '.___`-.   | || |   '.___`-.   | |
 | |  \ `.___.'\  | || |   _| |__/ |  | || | _/ /    \ \_ | || |  |`\____) |  | || |  |`\____) |  | |
 | |   `._____.'  | || |  |________|  | || ||____|  |____|| || |  |_______.'  | || |  |_______.'  | |
 | |              | || |              | || |              | || |              | || |              | |
 | '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
  '----------------'  '----------------'  '----------------'  '----------------'  '----------------' 
*/
class MetricsConfig {
    constructor() {
        util.applySettings(this, defaultMetricsConfig);
        this.metrics = getMetrics(this.name);
    }

    setup(setting) {
        if (setting) {
            util.applySettings(this, setting);
        }
        this.metrics = getMetrics(this.name);
    }
}

module.exports = new MetricsConfig();
