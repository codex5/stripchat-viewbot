const inquirer = require('inquirer');
const { Worker } = require('node:worker_threads');
const fs = require('fs');

inquirer.prompt([
    {
        type: 'input',
        name: 'channel',
        message: 'Enter channel name:'
    },
    {
        type: 'input',
        name: 'threads',
        message: 'Enter number of threads:'
    }
]).then(answers => {

    const proxies = fs.readFileSync('proxies.txt', 'utf-8').split('\r\n');

    for (let i = 0; i < answers.threads; i++) {
        const worker = new Worker('./worker.js', {
            workerData: {
                channel: answers.channel,
                proxies: proxies
            }
        });

        worker.onexit = (code) => {
            if (code == 1) {
                console.log("worker died due to error")
            }
        }
    }

});