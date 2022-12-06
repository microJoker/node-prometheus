const http = require('http')
const request = require('request-promise-native');
const register = require('prom-client').register;
const {CONFIG} = require('node-superconf')

const PROMETHEUS_PORT = CONFIG.UNION.service.prometheus.PROMETHEUS_PORT || 28080
const PROMETHEUS_REGISTER_HOST = CONFIG.UNION.service.prometheus.register_url


// 到基础架构组注册
function register_prometheus_metrics() {
    let proj_name = process.env.PROJECT_NAME;
    let pod_ip = process.env.POD_IP;
    let pod_name = process.env.HOSTNAME;
    let pod_namespace = process.env.NAMESPACE;

    console.log('****************************', pod_ip, pod_name, pod_namespace, PROMETHEUS_PORT)

    if (!pod_ip) return
    let json_data = {
        "ID": pod_name,
        "Name": proj_name,
        "Tags": ["app", "monitor", proj_name, pod_namespace, pod_name],
        "Address": pod_ip,
        "Port": PROMETHEUS_PORT,
        "checks": [
            {
                "http": `http://${pod_ip}:${PROMETHEUS_PORT}/metrics`,
                "interval": "30s"
            }
        ]
    }
    try {
        console.log('register_prometheus_metrics', PROMETHEUS_REGISTER_HOST, json_data)
        request({
            url: `${PROMETHEUS_REGISTER_HOST}/v1/agent/service/register`,
            method: "put",
            headers: {"content-type": "application/json",},
            json: true,
            body: json_data,
            timeout: 5000
        }).then(res => {console.log(`register_prometheus_metrics: ${res}`);}).catch(err => {console.log(`register_prometheus_metrics: ${err}`);})
        return {}
    } catch (e) {
        return {}
    }
}


const prometheus_server = http.createServer(async (req, res) => {
    if (req.url === '/metrics') {
        try {
            res.setHeader('Content-Type', register.contentType);
            res.end(await register.metrics());
        } catch (ex) {
            res.status(500).end(ex);
        }
    }
})


module.exports = {
    prometheus_server,
    register_prometheus_metrics
}
