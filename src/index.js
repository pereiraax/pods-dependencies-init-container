const { getRunningPods, onePodReady } = require('./lib/kubUtils');
const { podLabels, maxRetry, initialDelay, retryTimeOut } = require('./lib/config');
const CurrentDate = () => { };
CurrentDate.toString = () => `[${new Date().toISOString()}]`
console.info = console.info.bind(console, '%s', CurrentDate);
console.error = console.error.bind(console, '%s', CurrentDate);

console.info('Started pod dependency lookup');
let nbTrys = 1;
let podReady = [];

const checkIfPodsRunning = async () => {
  try {
    console.info(`Checking for running pods try ${nbTrys}, label(s) to check :`);
    console.table(podLabelList);
    for (const [index, podLabel] of podLabelList.entries()) {
        const pods = await getRunningPods(podLabel);
        if(pods.length > 0 ){
            const isReady = await onePodReady(pods);
            if(isReady){
                console.info(`One pod with label ${podLabel} is ready`);
                podReady.push(podLabel);
            }
        }
    };
   
    // Filter pods not ready.
    podLabelList = podLabelList.filter(podLabel => !podReady.includes(podLabel));

    if (podLabelList.length === 0) {
        console.info(`At least one pod for each given labels is running.`);
        process.exit(0);
    } else if (nbTrys < maxRetry) {
        setTimeout(checkIfPodsRunning, retryTimeOut);
    } else {
        console.error(`${podLabelList.length} pod(s) are not running yet after ${nbTrys} try(s)`);
        process.exit(1);
    }
    nbTrys++;

  } catch (error) {
    console.error('Error when fetching running pod list');
    console.error(error, error.message, error.stack);
    process.exit(1);
  }
};

// launch lookup 
let podLabelList = podLabels.split(';');

setTimeout(checkIfPodsRunning, initialDelay);