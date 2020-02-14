# Deucalion: Under development

Deucalion the son of Prometheus.

Exposes easy-to-use API for collecting metrics on microserices. Powerd by packages from [@promster](https://github.com/tdeekens/promster) & [prom-client](https://github.com/siimon/prom-client) and Cloud Native Computing Foundation graduated project [Prometheus](https://github.com/prometheus/prometheus).

**IMPORTANT NOTE:** All 4 main components are powered by **Singleton Pattern** and can be imported around without need to instantiate or set them up again.

This library exposes main **objects**:

-   Metrics
-   Plugin
-   Route
-   Server

and functions for writing custom **handlers**:

-   getContentType()
-   getSummary()

## ❯ Installation

```
npm i --save deucalion
```

## ❯ Metrics

**IMPORTANT:** You can find all default metrics definitions [HERE](dhttps://github.com/Must4che/deucalion/blob/master/default-metrics-definition.md).

This object exposes 2 basic methods:

-   **init** - Requires at least one parameter (service name(always required), custom metrics definition).
-   **addMetric** - This method can be used to one or multiple metrics after init.

Basic init only needs name of your service. And it will create default metrics objects.

```
const { metrics } = require('deucalion');

metrics.init({ name: 'serviceName' });
```

**IMPORTANT:** If you want to collect also **Database and Kafka status Gauges** you must initialize metrics with atributes like in this example bellow. In case you want to collect Gauges you must write and define your own controller. For more info checkout sections **❯ Route** and **❯ getContentType(), getSummary()**.

```
const { metrics } = require('deucalion');

metrics.init({
    name: 'serviceName',
    dbStatus: true,
    kafkaStatus: true
});
```

Additionaly you can dedefine your own metrics by following this simple expample.

```
const { metrics } = require('deucalion');

metrics.init({ name: 'serviceName' }, [
    {
        metricType: 'Counter',
        name: 'serviceName_request_counter',
        help: 'Counts number of requests',
        labelNames: ['service']
    },
    {
        metricType: 'Histogram',
        name: 'serviceName_response_time',
        help: 'Counts response time of service',
        labelNames: ['service'],
        buckets: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]
    },
    {
        metricType: 'Gauge',
        name: 'serviceName_kafka_status',
        help: 'Shows Kafka status',
        labelNames: ['kafka']
    }
]);
```

You can always initialize with default metrics for service and then add new netrics with **addMetric** function() accepts bot single definition object or array od objects.

```
const { metrics } = require('deucalion');

metrics.init({ name: 'serviceName' });

metrics.addMetric({
    metricType: 'Counter',
    name: 'serviceName_custom_request_counter',
    help: 'Counts number of custom requests',
    labelNames: ['service']
});

metrics.addMetric([
    {
        metricType: 'Histogram',
        name: 'serviceName_custom_response_time',
        help: 'Counts response time of service',
        labelNames: ['service'],
        buckets: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]
    },
    {
        metricType: 'Gauge',
        name: 'serviceName_custom_kafka_status',
        help: 'Shows Kafka status',
        labelNames: ['kafka']
    }
]);
```

Then You can work with your defined metrics same as you would with standard prometheus metrics objects. You can access them through **name**. You can find more information on how to use Prometheus objects at [prom-client Documentation](https://github.com/siimon/prom-client).

Metrics object built on top of Singleton patter so after init you can inport this library around and use all defind metrics as this:

```
// controller.js
const { requestCounter } = require('deucalion').metrics;

const actions = require('./actions);

module.exports.getAllMembers = async (request, reply) => {
    const members = await actions.getAllMemebers();
    requestCounter.inc();
    return members;
};
```

## ❯ Plugin

This object creates plugin for your chosen framework(Currently supporting Fastify, Hapi, Express) and it then starts collecting generic service metrics. Then it can be registerd as any other middleware for these frameworks. Immediately after import you can access plugin object with default settings for fastify. Or you can initialize it with framework name.

### Fastify

```
const { plugin } = require('deucalion');

fastifyApp.register(plugin.create()):
```

### Hapi

```
const { plugin } = require('deucalion');

plugin.setup('hapi');
const metricsPlugin = plugin.create();

hapiApp.register(metricsPlugin({ options }));
```

### Express

```
const { plugin } = require('deucalion');

plugin.setup('express');
const metricsPlugin = plugin.create();

expressApp.use(metricsPlugin({expressApp, options }));
```

## ❯ Route

Is pretty much self explanastory. It it is an object with REST specifications that exposes `/metrics` endpoint for Prometheus. Only thing is that you have to write your own handler to handle the response. See the example bellow:

**IMPORTANT:** Route object have no handler defined. You can use `getSummary` and `getContentType` functions which are also exposed by this package. See them at the bottom of this file.

```
{
    method: 'GET',
    url: '/metrics',
    handler: null
}
```

So you can setup your object by calling setup function and passing it your own route specification:

```
const { route } = require('deucalion');

route.setup({
    method: 'GET',
    url: '/hello'
    handler: (request, reply) => {
        return reply.code(200).send('Hello!');
    }
});
```

Then you can use it as any other route object. For example:

```
const routes = require('./routes');
const { route: metricsRoute } = require('deucalion');

[...routes, metricsRoute].forEach((route) => server.route(route));
```

## ❯ Server

In some cases you might want to expose the gathered metrics through an individual server. This is useful for instance to not have GET /metrics expose internal server and business metrics to the outside world. See example bellow:

```
const { server } = require('deucalion');

// server runs by default on port 8888
const app = server.start();
```

You can always start your server on your own port.

```
const { server } = require('deucalion');

const app = server.start(1234);
```

## ❯ getContentType(), getSummary()

Are an exposed methods useful for writing your own REST handler for /metrics endpoint. It returns content type needed for Prometheus in case of getContentType. And return collected metrics in case of getSummary.

```
const { getContentType, getSummary } = require('deucalion');

module.exports.handler = (requests, reply) => {
    try {
        return reply
            .code(200)
            .header(getContentType())
            .send(getSummary());
    } catch (e) {
        return reply.code(500).send(e);
    }
};
```
