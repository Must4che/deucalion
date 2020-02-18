# Deucalion

![build](https://github.com/Must4che/deucalion/workflows/build/badge.svg) [![npm version](https://img.shields.io/npm/v/deucalion?color=blue&label=npm&logo=npm)](https://www.npmjs.com/package/deucalion) ![NPM downloads](https://img.shields.io/npm/dt/deucalion?color=blue&logo=npm) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

### Deucalion son of Prometheus.

Exposes easy-to-use API for collecting metrics on microserices. Powerd by packages [@promster](https://github.com/tdeekens/promster), [prom-client](https://github.com/siimon/prom-client) and CNCF graduated project [Prometheus](https://github.com/prometheus/prometheus).

**IMPORTANT NOTE:** All 4 main components are **Singletons** and can be imported around without need to instantiate or set them again.

This library exposes main **objects**:

-   Plugin
-   Route
-   Metrics
-   Server

and functions for writing custom **handlers**:

-   getContentType()
-   getSummary()

## ❯ Installation

```
npm i --save deucalion
```

## ❯ Plugin

**Deucalions main component.**

This object creates plugin for your chosen framework (Currently supporting Fastify, Hapi, Express, Marblejs) and it can collect generic service metrics. This plugin can be then registerd as any other middleware for these frameworks. Immediately after import you can access plugin object with default settings for Express. Or you can initialize it with framework name. You can read more on how to use in [@promster Documentation](https://github.com/tdeekens/promster/blob/master/readme.md) and more on how metrics are collected for Prometheus in [prom-client Documentation](https://github.com/siimon/prom-client/blob/master/README.md).

### Express

```
const { plugin } = require('deucalion');

const deucalionPlugin = plugin.create();

expressApp.use(deucalionPlugin({expressApp, options }));
```

### Fastify

```
const { plugin } = require('deucalion');

fastifyApp.register(plugin.setup('fastify').create()):
```

### Hapi

```
const { plugin } = require('deucalion');

// plugi.setup can be chained like this
const deucalionPlugin = plugin.setup('hapi').create();

hapiApp.register(deucalionPlugin({ options }));
```

### Marblejs

```
const { plugin, getContentType, getSummary } = require('deucalion');

const deucalionPlugin = plugin.setup('marblejs').create();

const middlewares = [
    deucalionPlugin()
];

const serveMetrics$ = EffectFactory.matchPath('/metrics')
  .matchType('GET')
  .use(req$ =>
    req$.pipe(
      mapTo({
        headers: { 'Content-Type': getContentType() },
        body: getSummary(),
      })
    )
  );
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

So you can setup your object by calling setup function and passing it your own route specification. `Feel free to pass in schema, beforHandler or define any other key in route object. Setup will apply all of them`:

```
const { route } = require('deucalion');
const { metrics } = require('./schemas');

route.setup({
    handler: (request, reply) => {
        return reply.code(200).send('Hello!');
    },
    schema: metrics
});
```

Then you can use it as any other route object. For example:

```
// fastify app
const routes = require('./routes');
const { route: deucalionRoute } = require('deucalion');

[...routes, deucalionRoute].forEach((route) => server.route(route));
```

## ❯ Metrics

**IMPORTANT:** You can find all default metrics definitions [HERE](https://github.com/Must4che/deucalion/blob/master/custom-metrics-definition.md).

This object exposes 2 basic methods(both chainable):

-   **init** - Requires at least one parameter (service name - `required`, custom metrics definition).
-   **addMetric** - This method can be used to one or multiple metrics after init.

Basic init only needs name of your service. And it will create basic custom metrics objects.

```
const { metrics } = require('deucalion');

metrics.init({ name: 'identity_service' });
```

**IMPORTANT:** If you want to collect also **Database and Kafka status Gauges** you must initialize metrics with atributes like in this example bellow. In case you want to collect Gauges you must write your own logic to get those statuses and then set them on gauge object. For more info checkout sections **Route, getContentType(), getSummary()** and [prom-client Documentation](https://github.com/siimon/prom-client/blob/master/README.md).

```
const { metrics } = require('deucalion');

metrics.init({
    name: 'identity_service',
    dbStatus: true, // false by default
    kafkaStatus: true // false by default
});
```

Additionaly you can dedefine your own metrics by following this simple expample.

```
const { metrics } = require('deucalion');

metrics.init({ name: 'identity_service' }, [
    {
        metricType: 'Counter',
        name: 'identity_service_request_counter',
        help: 'Counts number of requests',
        labelNames: ['service']
    },
    {
        metricType: 'Histogram',
        name: 'identity_service_response_time',
        help: 'Counts response time of service',
        labelNames: ['service'],
        buckets: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]
    },
    {
        metricType: 'Gauge',
        name: 'identity_service_kafka_status',
        help: 'Shows Kafka status',
        labelNames: ['kafka']
    }
]);
```

You can always initialize with basic custom metrics for service and then add new netrics with **addMetric** function accepts bot single definition object or array of objects.

```
const { metrics } = require('deucalion');

metrics.init({ name: 'identity_service' });

metrics.addMetric({
    metricType: 'Counter',
    name: 'identity_service_custom_request_counter',
    help: 'Counts number of custom requests',
    labelNames: ['service']
});

metrics.addMetric([
    {
        metricType: 'Histogram',
        name: 'identity_service_custom_response_time',
        help: 'Counts response time of service',
        labelNames: ['service'],
        buckets: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]
    },
    {
        metricType: 'Gauge',
        name: 'identity_service_custom_kafka_status',
        help: 'Shows Kafka status',
        labelNames: ['kafka']
    }
]);
```

Then You can work with your defined metrics same as you would with standard prometheus metrics objects. You can access them through **name**. You can find more information on how to use Prometheus objects at [prom-client Documentation](https://github.com/siimon/prom-client).

Custom Metrics are built as Singleton so after init you can inport this library around and use all defind metrics as this:

```
// controller.js
const { identity_service_custom_request_counter } = require('deucalion').metrics;

const actions = require('./actions);

module.exports.getAllMembers = async (request, reply) => {
    const members = await actions.getAllMemebers();
    identity_service_custom_request_counter.inc();
    return members;
};
```

## ❯ Server

In some cases you might want to expose the gathered metrics through an individual server. This is useful for instance to not have GET /metrics expose internal server and business metrics to the outside world. Or simply because your service does not expose rest API. See example bellow:

```
const { server } = require('deucalion');

// server runs by default on port 7788
const app = server.start();
```

You can always start your server on your own port.

```
const { server } = require('deucalion');

const app = server.start(1234);
```

For aditional info check out [@promster/server Documentation](https://github.com/tdeekens/promster/blob/master/readme.md).

## ❯ getContentType(), getSummary()

Are an exposed methods useful for writing your own REST handler for /metrics endpoint. It returns content type needed for Prometheus in case of getContentType. And return collected metrics in case of getSummary.

```
const { getContentType, getSummary } = require('deucalion');

module.exports.handler = (requests, reply) => {
    try {
        return reply
            .header('Content-Type', getContentType())
            .code(200)
            .send(getSummary());
    } catch (e) {
        return reply
            .header('Content-Type', 'application/json')
            .code(500)
            .send(e);
    }
};
```
