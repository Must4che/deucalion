'use strict';

const { Prometheus } = require('@promster/fastify');
const metricsConfig = require('./metricsConfig');
const { removeAttributes } = require('../util');

const applyMetrics = (self, metrics) => {
    const hydratedSelf = self;
    removeAttributes(hydratedSelf);
    metrics.forEach((metric) => {
        hydratedSelf.addMetric(metric);
    });
};

const addMetric = (self, { metricType, name, help, labelNames, buckets = undefined }) => {
    const newself = self;
    try {
        newself[name] = new Prometheus[metricType]({
            name,
            help,
            labelNames,
            buckets
        });
    } catch (e) {
        console.error('Incorrect metric definition.', e);
        throw e;
    }
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
class Metrics {
    addMetric(definition) {
        const metrics = definition.length ? definition : [definition];
        metrics.forEach((metric) => {
            addMetric(this, metric);
        });
    }

    init(...args) {
        const setting = args[0];
        const customMetrics = args[1];
        const name = setting && setting.name ? setting.name : undefined;
        if (!setting && !name && !customMetrics) {
            throw new Error('Service name or metrics definition must be defined during init.');
        }
        metricsConfig.setup(setting);
        const metricsSetting = customMetrics || metricsConfig.metrics;
        applyMetrics(this, metricsSetting);
    }
}

module.exports = new Metrics();
