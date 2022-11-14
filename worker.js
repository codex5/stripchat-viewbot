const { workerData } = require('node:worker_threads');
const needle = require('needle');
const proxyAgent = require('proxy-agent');
const rau = require('random-useragent');

function start() {
    return new Promise((resolve, reject) => {

        needle.get("https://stripchat.com/api/front/v2/models/username/" + workerData.channel + "/chat", { json: true }, (err, res) => {

            if (err) {
                reject(err);
            }

            const channelId = res.body.messages[0].modelId;

            setInterval(() => {

                const proxy = workerData.proxies[Math.floor(Math.random() * workerData.proxies.length)];
                const agent = new proxyAgent("http://" + proxy);

                try {
                    needle.get('https://stripchat.com/api/front/v2/config/data', { agent: agent, json: true }, (err, res) => {

                        if (err) return;

                        let cookies = {
                            "ABTest_ab_25_tokens_instead_20_key": "A",
                            "ABTest_ab_google_sign_in_key": "B",
                            "ABTest_ab_index_header_names_couples_key": "A",
                            "ABTest_ab_index_header_names_guys_trans_key": "B",
                            "ABTest_ab_onboarding_dialog_key": "B",
                            "ABTest_recommended_v40_key": "B",
                            "ABTest_start_private_with_price_key": "B",
                            "stripchat_com_guestId": res.body.data.sessionHash,
                            "stripchat_com_firstVisit": encodeURIComponent(res.body.data.firstVisitAt),
                            "guestWatchHistoryIds": channelId,
                            "isVisitorsAgreementAccepted": "1"
                        }
                        const cookieString = Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join('; ');

                        const random = "xxxxxxxxxxxxxxxx".replace(/[x]/g, function (c) {
                            var r = Math.random() * 16 | 0,
                                v = c == 'x' ? r : (r & 0x3 | 0x8);
                            return v.toString(16);
                        });

                        needle.put('https://stripchat.com/api/front/models/' + channelId + '/viewers/' + res.body.data.guestId,
                            {
                                "tabId": res.body.data.tabId,
                                "fingerprint": "",
                                "csrfToken": res.body.data.csrfToken,
                                "csrfTimestamp": res.body.data.csrfTimestamp,
                                "csrfNotifyTimestamp": res.body.data.csrfNotifyTimestamp,
                                "uniq": random
                            }, {
                            headers: {
                                "User-Agent": rau.getRandom(),
                                "referer": "https://stripchat.com/" + workerData.channel,
                                "Cookie": cookieString
                            }, agent: agent, json: true
                        }, (err, res) => {
                            if (err) return;
                            if (res.statusCode >= 200 && res.statusCode < 300) {
                                console.log('Success');
                            }
                        });
                    });
                } catch (err) {
                }

            }, 10);
        })
    });
}

start().then(() => { process.exit(0) }).catch(() => { process.exit(1) })

process.on('uncaughtException', function (err) {
    console.log("Error");
}).on('unhandledRejection', function (err) {
    console.log("Error");
});