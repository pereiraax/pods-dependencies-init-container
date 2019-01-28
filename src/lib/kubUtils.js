const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;
const { namespace } = require('./config');
const client = new Client({ config: config.getInCluster() });
let specLoaded = false;

const getRunningPods = (podLabels) => new Promise(async (resolve, reject) => {
  try {
    if (!specLoaded) {
      await client.loadSpec();
      specLoaded = true;
    }
    const response = await client.api.v1.namespaces(namespace).pods.get({ qs: { labelSelector: podLabels, fieldSelector: 'status.phase=Running' } });
    resolve(response.body.items);
  } catch (error) {
    reject(error);
  }
});

const onePodReady = (pods) => new Promise(async (resolve) => {
    pods.forEach(pod => {
        const containerNotReady = pod.status.containerStatuses.filter(status => !status.ready);
        if(containerNotReady.length === 0){
            resolve(true);
        }
    })
    resolve(false);
})

module.exports = {
  getRunningPods,
  onePodReady
};