/* eslint-disable no-underscore-dangle */

'use-strict';

const lab = require('lab').script();
const sinon = require('sinon');
const Code = require('code');
const fastify = require('fastify');

const { expect } = Code;
const lib = require('../index');
const metricsConfig = require('../lib/metrics/metricsConfig');
const defaultConfig = require('../lib/config');
const util = require('../lib/util');

const { route, plugin, server, metrics, getSummary, getContentType } = lib;
exports.lab = lab;

let pluginSetupSpy;
let serverStartSpy;
let routeSetupSpy;
let metricsSpy;
let metricsConfigSpy;
let utilApplySettingsSpy;
let utilRemoveAttributesSpy;

lab.experiment('Metrics npm package', () => {
    lab.experiment('SERVER', () => {
        lab.beforeEach(async () => {
            serverStartSpy = sinon.spy(lib.server, 'start');
        });
        lab.afterEach(async () => {
            serverStartSpy.restore();
        });

        lab.test('should start properly with default values', async () => {
            const app = await server.start();

            expect(app).to.be.an.object();
            expect(app._connectionKey.includes(defaultConfig.port.toString())).to.be.true();
            expect(serverStartSpy.calledOnce).to.be.true();
        });

        lab.test('should start properly with custom values', async () => {
            const port = 1234;
            const app = await server.start(port);

            expect(app).to.be.an.object();
            expect(app._connectionKey.includes(port.toString())).to.be.true();
            expect(serverStartSpy.calledOnce).to.be.true();
        });
    });

    lab.experiment('PLUGIN', () => {
        lab.beforeEach(async () => {
            pluginSetupSpy = sinon.spy(plugin, 'setup');
        });

        lab.afterEach(async () => {
            pluginSetupSpy.restore();
        });

        lab.test('should return fastify plugin by default', async () => {
            const pluginInstance = plugin.create();
            const symbolKey = Reflect.ownKeys(pluginInstance).find((key) => {
                return key.toString() === 'Symbol(fastify.display-name)';
            });

            expect(pluginInstance).to.be.a.function();
            expect(pluginInstance[symbolKey]).to.be.equal('@promster/fastify');
            expect(pluginSetupSpy.calledOnce).to.be.false();
        });

        lab.test('should return express plugin when called with correct settings', async () => {
            const name = 'express';
            plugin.setup(name);
            const pluginInstance = plugin.create();

            expect(pluginInstance).to.be.a.function();
            expect(pluginInstance.name).to.be.equal('createMiddleware');
            expect(pluginSetupSpy.calledOnceWith(name)).to.be.true();
        });

        lab.test('should return express plugin when called with correct settings', async () => {
            const name = 'hapi';
            plugin.setup(name);
            const pluginInstance = plugin.create();

            expect(pluginInstance).to.be.a.function();
            expect(pluginInstance.name).to.be.equal('createPlugin');
            expect(pluginSetupSpy.calledOnceWith(name)).to.be.true();
        });
    });
    lab.experiment('ROUTE', () => {
        lab.beforeEach(async () => {
            routeSetupSpy = sinon.spy(route, 'setup');
        });

        lab.afterEach(async () => {
            routeSetupSpy.restore();
        });

        lab.test('should return default route object with handler = null', async () => {
            expect(route).to.be.a.object();
            expect(route.method).to.be.equal(defaultConfig.route.method);
            expect(route.url).to.be.equal(defaultConfig.route.url);
            expect(route.handler).to.be.null();
            expect(routeSetupSpy.calledOnce).to.be.false();
        });

        lab.test('should return route object with defind handler', async () => {
            route.setup({
                handler: (request, reply) => reply.code(200).send({ statusMessage: 'OK' })
            });

            expect(route).to.be.a.object();
            expect(route.method).to.be.equal(defaultConfig.route.method);
            expect(route.url).to.be.equal(defaultConfig.route.url);
            expect(route.handler).to.be.a.function();
            expect(routeSetupSpy.calledOnce).to.be.true();
        });

        lab.test('handler should response with code 200', async () => {
            const app = fastify({ logger: false });
            app.get('/', (request, reply) => {
                return reply.code(200).send({ statusMessage: 'OK' });
            });

            const options = {
                method: 'GET',
                url: '/'
            };
            const response = await app.inject(options);

            expect(response.statusCode).to.be.equal(200);
            expect(response.statusMessage).to.be.equal('OK');
        });

        lab.test('should return route object with custom settings', async () => {
            const setting = {
                method: 'POST',
                url: '/customroute',
                handler: () => true
            };

            route.setup(setting);

            expect(route).to.be.a.object();
            expect(route.method).to.be.a.string();
            expect(route.method).to.be.equal(setting.method);
            expect(route.url).to.be.equal(setting.url);
            expect(route.handler).to.be.a.function();
            expect(route.handler()).to.be.true();
            expect(routeSetupSpy.calledOnceWith(setting)).to.be.true();
        });
    });
    lab.experiment('METRICS', () => {
        lab.beforeEach(async () => {
            metricsSpy = sinon.spy(metrics, 'init');
            metricsConfigSpy = sinon.spy(metricsConfig, 'setup');
        });

        lab.afterEach(async () => {
            metricsSpy.restore();
            metricsConfigSpy.restore();
        });

        lab.test('object should be initialized properly with default setting', async () => {
            metrics.init({ name: 'defaultTest' });

            expect(metricsSpy.calledOnce).to.be.true();
            expect(metricsConfigSpy.calledOnce).to.be.true();
            expect(Object.keys(metrics).length).to.be.equal(metricsConfig.metrics.length);
        });

        lab.test('object should be initialized properly with default setting and status Gauges', async () => {
            metrics.init({
                name: 'gaugeTest',
                dbStatus: true,
                kafkaStatus: true
            });

            expect(metricsSpy.calledOnce).to.be.true();
            expect(metricsConfigSpy.calledOnce).to.be.true();
            expect(Object.keys(metrics).length).to.be.equal(metricsConfig.metrics.length);
        });

        lab.test('object should be initialized properly with custom setting', async () => {
            const serviceName = { name: 'customSettingTest' };
            const setting = [
                {
                    metricType: 'Counter',
                    name: `test1_request_counter`,
                    help: 'Counts number of requests',
                    labelNames: ['service']
                }
            ];
            metrics.init(serviceName, setting);

            expect(metricsSpy.withArgs(serviceName, setting).calledOnce).to.be.true();
            expect(metricsConfigSpy.calledOnceWith(serviceName)).to.be.true();
            expect(Object.keys(metrics).length).to.be.equal(setting.length);
        });

        lab.test('object should throw error on incorrect init', async () => {
            try {
                metrics.init();
                Code.fail('This shound fail with an Exception');
            } catch (e) {
                expect(e.name).to.be.equal('Error');
                expect(e.message).to.be.equal('Service name or metrics definition must be defined during init.');
            }
        });

        lab.test('should start properly anfter init and add new custom metric', async () => {
            const customConfig = { name: 'addMetricTest' };
            const metricSetting = {
                metricType: 'Counter',
                name: `${customConfig.name}_test_counter`,
                help: 'This is a test Counter',
                labelNames: ['service']
            };

            metrics.init(customConfig);
            metrics.addMetric(metricSetting);

            const newMetricCreated = Object.keys(metrics).includes(metricSetting.name);

            expect(metricsSpy.calledOnceWith(customConfig)).to.be.true();
            expect(metricsConfigSpy.calledOnceWith(customConfig)).to.be.true();
            expect(newMetricCreated).to.be.true();
        });

        lab.test('should start properly anfter init and add multiple new custom metrics', async () => {
            const metricPrefix = { name: 'addMultipleMetricsTest' };
            const metricSettings = [
                {
                    metricType: 'Counter',
                    name: `${metricPrefix.name}_first_test_counter`,
                    help: 'This is a test Counter',
                    labelNames: ['service']
                },
                {
                    metricType: 'Counter',
                    name: `${metricPrefix.name}_second_test_counter`,
                    help: 'This is a test Counter',
                    labelNames: ['service']
                }
            ];

            metrics.init(metricPrefix);
            metrics.addMetric(metricSettings);

            const firstMetricCreated = Object.keys(metrics).includes(metricSettings[0].name);
            const secondMetricCreated = Object.keys(metrics).includes(metricSettings[0].name);

            expect(metricsSpy.calledOnceWith(metricPrefix)).to.be.true();
            expect(metricsConfigSpy.calledOnceWith(metricPrefix)).to.be.true();
            expect(firstMetricCreated).to.be.true();
            expect(secondMetricCreated).to.be.true();
        });

        lab.test('shoud throw an Error', async () => {
            const metricPrefix = { name: 'TypeErrorTest' };
            const incorrectSetting = {
                metricType: 'nonexistincMetricType',
                name: `${metricPrefix}_test_counter`,
                help: 'This is a test Counter',
                labelNames: ['service']
            };
            try {
                metrics.init(metricPrefix);
                metrics.addMetric(incorrectSetting);
                Code.fail('This shound fail with an Exception');
            } catch (e) {
                expect(e.name).to.be.equal('TypeError');
                expect(e.message).to.be.equal('Prometheus[metricType] is not a constructor');
            }
        });

        lab.test('shoud create and increment newly added custom metric', async () => {
            const metricPrefix = { name: 'creationAndFunctionalityTest' };
            const metricSetting = {
                metricType: 'Counter',
                name: `${metricPrefix.name}_test_counter`,
                help: 'This is a test Counter',
                labelNames: ['service']
            };

            metrics.init(metricPrefix);
            metrics.addMetric(metricSetting);

            const testCounter = metrics[metricSetting.name];
            testCounter.inc();

            expect(metricsSpy.calledOnceWith(metricPrefix)).to.be.true();
            expect(metricsConfigSpy.calledOnceWith(metricPrefix)).to.be.true();
            expect(testCounter.hashMap[''].value).to.be.equal(1);
        });
    });

    lab.experiment('HELPERS', () => {
        lab.beforeEach(async () => {
            serverStartSpy = sinon.spy(lib.server, 'start');
        });
        lab.afterEach(async () => {
            serverStartSpy.restore();
        });

        lab.test('should return getSummary metrics summary', async () => {
            const getSummaryFunc = getSummary();

            expect(getSummaryFunc).to.be.a.string();
        });

        lab.test('should return getContentType metrics Content-Type', async () => {
            const getContentTypeFunc = getContentType();

            expect(getContentTypeFunc).to.be.a.string();
        });
    });

    lab.experiment('UTIL', () => {
        lab.beforeEach(async () => {
            utilApplySettingsSpy = sinon.spy(util, 'applySettings');
            utilRemoveAttributesSpy = sinon.spy(util, 'removeAttributes');
        });
        lab.afterEach(async () => {
            utilApplySettingsSpy.restore();
            utilRemoveAttributesSpy.restore();
        });

        lab.test('applySettings should setup objects attributes correctly', async () => {
            const testedObject = {};
            const settings = {
                name: 'test',
                handler: () => true
            };

            util.applySettings(testedObject, settings);

            expect(utilApplySettingsSpy.calledOnce).to.be.true();
            expect(Object.keys(testedObject).length).to.be.equal(2);
            expect(testedObject.name).to.be.a.string();
            expect(testedObject.handler).to.be.a.function();
        });

        lab.test('removeAttributes should remove all objects attributes', async () => {
            const testedObject = {
                name: 'test',
                handler: () => true
            };

            util.removeAttributes(testedObject);

            expect(utilRemoveAttributesSpy.calledOnce).to.be.true();
            expect(Object.keys(testedObject).length).to.be.equal(0);
        });
    });
});
