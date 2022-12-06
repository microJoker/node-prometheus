const prom_client = require('prom-client');


/*
公共的标签，所有监控对象都需要记录的信息
server_name     服务名
pod_namespace   集群的pod所在的命名空间
pod_name        集群的pod名
module          监控的模块
*/
const common_labels = ['server_name', 'pod_namespace', 'pod_name', 'module']

// 自定义的counter监控对象
const custom_counter = new prom_client.Counter({
    name: 'custom_counter',
    help: 'custom counter monitor',
    labelNames: common_labels
})

// 接口访问数量的监控对象
const api_counter = new prom_client.Counter({
    name: 'api_counter',
    help: 'api counter monitor',
    labelNames: common_labels
})

// 接口访问耗时的监控对象
const api_histogram = new prom_client.Histogram({
    name: 'api_histogram',
    help: 'api histogram monitor',
    labelNames: ['url', 'status_code', ...common_labels],
    buckets: [100, 500, 1000, 5000]
})


const PrometheusClient = {

    common_labels_value: () => {
        return {
            server_name: process.env.PROJECT_NAME,
            pod_namespace: process.env.NAMESPACE,
            pod_name: process.env.HOSTNAME
        }
    },

    // 自定义的counter监控对象
    send_custom_counter: (module) => {
        let labels = PrometheusClient.common_labels_value()
        labels['module'] = module
        custom_counter.labels(...labels).inc()
    },

    // 所有接口访问数量的监听对象打点
    send_api_counter: () => {
        try {
            let labels = PrometheusClient.common_labels_value()
            labels['module'] = 'api_monitor'
            api_counter.inc(labels)
        } catch (e) {
            console.log(e)
        }
    },

    // 接口访问耗时的监听对象打点
    send_api_histogram: (url, process_time, status_code) => {
        try {
            let labels = PrometheusClient.common_labels_value()
            labels['module'] = 'api_monitor'
            labels['url'] = url
            labels['status_code'] = status_code
            api_histogram.labels(labels).observe(process_time)
        } catch (e) {
            console.log(e)
        }
    },

}


module.exports = {
    PrometheusClient,
}

