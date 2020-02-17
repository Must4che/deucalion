'use strict';

const util = require('../util');
const defaultMetricsConfig = require('../config').metrics;

const getMetrics = (self) => {
    const { dbStatus, kafkaStatus } = self;
    const basicMetrics = [
        {
            name: `${self.name}_request_counter`,
            metricType: 'Counter',
            help: 'Counts number of REST requests',
            labelNames: ['service']
        },
        {
            name: `${self.name}_produce_counter`,
            metricType: 'Counter',
            help: 'Counts number of produced kafka events',
            labelNames: ['event']
        },
        {
            name: `${self.name}_response_time`,
            metricType: 'Histogram',
            help: 'Counts response time of a service',
            labelNames: ['service'],
            buckets: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]
        },
        {
            name: `${self.name}_produce_response_time`,
            metricType: 'Histogram',
            help: 'Counts response time of an produced kafka event',
            labelNames: ['event'],
            buckets: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]
        }
    ];
    const dbStatusGauges = {
        name: `${self.name}_database_status`,
        metricType: 'Gauge',
        help: 'Shows database status',
        labelNames: ['db']
    };
    const kafkaStatusGauge = {
        name: `${self.name}_kafka_status`,
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
        this.metrics = getMetrics(this);
    }

    setup(setting) {
        if (setting) {
            util.applySettings(this, setting);
        }
        this.metrics = getMetrics(this);
    }
}

module.exports = new MetricsConfig();
