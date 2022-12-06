const {initSuperconf, CONFIG} = require('node-superconf')
var express = require('express')
const {PrometheusClient} = require('node-prometheus/prometheus/client')
    

// 普罗米修斯客户端放中间件打点
const prometheus_middleware = async (ctx, next) => {
    PrometheusClient.send_api_counter()
    let start_time = new Date().getTime()
    await next()
    let end_time = new Date().getTime()
    PrometheusClient.send_api_histogram(ctx.routePath, end_time - start_time, ctx.response.status)
}


initSuperconf('xxx').then(() => {
    console.log('initSuperconf success => CONFIG: ', CONFIG);

    const {prometheus_server, register_prometheus_metrics} = require('node-prometheus')

    // 本地起普罗米修斯服务，用于给架构组拉取打点数据
    prometheus_server.listen(28080, () => {
        register_prometheus_metrics("xxx");
        console.log('Prometheus server listen at port: ' + 28080, new Date().getTime());
    });

    // 起项目
    var app = express()
    app.use(prometheus_middleware)
    app.get('/', function (req, res) {
      res.send('Hello World')
    })
    app.listen(8080, () => {
        console.log('Listen at port: ' + 8080, new Date().getTime());
    })
})
