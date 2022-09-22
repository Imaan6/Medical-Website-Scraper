const puppeteer = require('puppeteer');
const ObjectsToCsv = require('objects-to-csv');
const prompt = require('prompt-sync')()


async function start() {
    const question = prompt('Which disease would you like to know more about?')

    console.log(`You would like to know more about ${question}`)

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://my.clevelandclinic.org/search?q=${question}`, {
        waitUntil: 'networkidle2'
    });
    // await new Promise(r => setTimeout(r, 3000));
    await page.evaluate((question) => {
        console.log(document.getElementsByClassName('list-item-article list-pad-bottom')[0].children[0].innerText.toLowerCase().includes(question.toLowerCase()) ? document.getElementsByClassName('list-item-article list-pad-bottom')[0].children[0].children[0].click() : console.log("ERROR"))
    }, question).catch(() => console.log("NOT FOUND"))
    await new Promise(r => setTimeout(r, 3000));
    let result = await page.evaluate((question) => {
        let obj = [];
        Object.values(document.getElementsByTagName('H3')).forEach(e => { obj.push({ text: e.nextSibling.nextSibling.innerText, title: e.innerText }) });
        return (obj);
    }, question).catch(() => console.log("NOT FOUND"))


    const csv = new ObjectsToCsv(result);

    await csv.toDisk('./data.csv');

    console.log(await csv.toString());
    await browser.close();
};

start();