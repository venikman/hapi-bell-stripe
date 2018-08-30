const puppeteer = require('puppeteer');

const script = async () => {
    const browser = await puppeteer.launch({
        headless          : false,
        ignoreHTTPSErrors : true
    });
    const page = await browser.newPage();
    await page.goto('https://localhost:3000/connect-artist');
    const startTime = Date.now();
    const phoneNumberInput = await page.waitFor('#phoneNumber');
    await phoneNumberInput.type('0000000000');
    await page.type('#accountEmail', 'iamfake@fake.com');
    await page.click('.bs-Button');
    const phoneCodeInput = await page.waitFor('.bs-CodePuncher');
    await phoneCodeInput.focus();
    await phoneCodeInput.type('000000');
    const firstNameInput = await page.waitFor('.hs-Field-firstName');
    await firstNameInput.type('Firstname');
    await page.type('.hs-Field-lastName', 'Lastname');
    await page.type('#legalEntityDateOfBirth', '03');
    await page.type('#legalEntityDateOfBirth', '31');
    await page.type('#legalEntityDateOfBirth', '19');
    await page.type('#legalEntityDateOfBirth', '89');
    await page.click('.hs-SelectMenuInput > div:nth-child(2)');
    const routingNumberInput = await page.waitFor('#routingNumber');
    await routingNumberInput.type('110000000');
    await page.type('#accountNumber', '000123456789');
    const confirmAccountNumberInput = await page.waitFor('#confirmAccountNumber');
    await confirmAccountNumberInput.type('000123456789');
    const secondsToWait = 90;
    await page.waitFor(secondsToWait * 1000 - (Date.now() - startTime));
    await page.click('.bs-Button');
    await page.waitForFunction(() => {
        return document.body.innerText === 'Hello, world!';
    });
    await browser.close();
};
 module.exports = script;
