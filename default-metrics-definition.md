# Default metrics definition

Lets say that you initiated your metrics with full default settings like in example bellow. Our example defines service name as **member**.

```
const { metrics } = require('deucalion');

metrics.init({
    name: 'member',
    dbStatus: true,
    kafkaStatus: true
});
```

## Definitions

**IMPORTANT:** You can always access and work with your metrics through **Metrics** object by simply requiring this package and then accessing its attributes via **name**:

```
// Controller.js - for example we access default metric member_metrics_request_counter
const { getContentType, getSummary, metrics } = require('deucalion');
const { member_metrics_request_counter } = metrics;

const metricsHandler = (request, reply) => {
    member_metrics_request_counter.inc();
    return reply
        .header(getContentType())
        .code(200)
        .send(getSymmary());
};
```

### ❯ {name}_metrics_request_counter

-   **name:** {name}_metrics_request_counter
-   **metricType:** Counter
-   **help:** Counts number of requests for /metrics endpoint
-   **labelNames:** ['metrics']

### ❯ {name}_request_counter

-   **name:** {name}_request_counter
-   **metricType:** Counter
-   **help:** Counts number of REST requests
-   **labelNames:** ['service']

### ❯ {name}_produce_counter

-   **name:** {name}_produce_counter
-   **metricType:** Counter
-   **help:** Counts number of produced kafka events
-   **labelNames:** ['produce']

### ❯ {name}_consume_counter

-   **name:** {name}_consume_counter
-   **metricType:** Counter
-   **help:** Counts number of consumed kafka events
-   **labelNames:** ['consume']

### ❯ {name}_response_time

-   **name:** {name}_response_time
-   **metricType:** Histogram
-   **help:** Counts response time of a service
-   **labelNames:** ['service']
-   **buckets:** [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]

### ❯ {name}_produce_response_time

-   **name:** {name}_produce_response_time
-   **metricType:** Histogram
-   **help:** Counts response time of an produced kafka event
-   **labelNames:** ['produce']
-   **buckets:** [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]

### ❯ {name}_event_response_time

-   **name:** {name}_event_response_time
-   **metricType:** Histogram
-   **help:** Counts Counts response time of an consumed kafka event
-   **labelNames:** ['consume']
-   **buckets:** [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]

### ❯ {name}_database_status

-   **name:** {name}_database_status
-   **metricType:** Gauge
-   **help:** Shows database status
-   **labelNames:** ['db']

### ❯ {name}_kafka_status

-   **name:** {name}_kafka_status
-   **metricType:** Gauge
-   **help:** Shows Kafka status
-   **labelNames:** ['kafka']
