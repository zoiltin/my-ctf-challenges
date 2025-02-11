const puppeteer = require('puppeteer');

const HOST = 'localhost:3000';
const FLAG = process.env.FLAG ?? 'flag{test}';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const visit = async (text) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  await browser.setCookie({
    name: 'flag',
    value: FLAG,
    domain: HOST,
    path: '/',
    httpOnly: false
  });

  const page = await browser.newPage();

  await page.goto(`http://${HOST}/?text=${encodeURI(text)}`);
  await sleep(5000);
  await page.close();
}

module.exports = {visit};