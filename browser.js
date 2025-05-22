const puppeteer = require('puppeteer');

const startBrowser = async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false, // Để dễ debug, có thể đổi thành true khi chạy ổn định
            args: ['--disable-setuid-sandbox'],
            ignoreHTTPSErrors: true,
        });
        return browser;
    } catch (error) {
        console.log("Không tạo được browser: ", error);
    }
};

module.exports = startBrowser;