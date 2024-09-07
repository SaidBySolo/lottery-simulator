import fetch from 'node-fetch';
import currentData from "./lotteryData.json" assert { type: "json" }
import fs from 'node:fs'


const url = new URL('https://www.dhlottery.co.kr/common.do?method=getLottoNumber');

let drwNo = currentData[currentData.length - 1]?.drwNo;

if (drwNo === undefined) {
    drwNo = 0;
}

const LotteryData = [];

const lotteryDataFetch = async () => {
    drwNo = drwNo + 1;
    url.searchParams.set('drwNo', drwNo);

    const requests = [];
    for (let i = 0; i < 10; i++) { // Adjust the number of parallel requests as needed
        requests.push(fetch(url));
    }

    const responses = await Promise.all(requests);
    const data = await Promise.all(responses.map(response => response.json()));

    for (const item of data) {
        if (item.returnValue !== "fail") {
            LotteryData.push(item);
        }
    }

    if (LotteryData.length < 100) { // Adjust the desired number of data items
        await lotteryDataFetch();
    }
}

lotteryDataFetch().then(() => {
    fs.writeFile('lotteryData.json', JSON.stringify(LotteryData), (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
});


