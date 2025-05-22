const scrapeCategory = require('./scraper');
const fs = require('fs').promises;

const scrapeController = async (browserInstance) => {
    const url = 'https://books.toscrape.com';
    try {
        let browser = await browserInstance;
        // Gọi hàm scrape
        let booksByCategory = await scrapeCategory(browser, url);
        console.log('Hoàn tất scrape, danh sách categories:', Object.keys(booksByCategory));

        // Lưu dữ liệu vào file JSON
        await fs.writeFile('books.json', JSON.stringify(booksByCategory, null, 2));
        console.log('Đã lưu dữ liệu vào books.json');

        await browser.close();
    } catch (error) {
        console.log("Lỗi ở scrape controller: ", error);
    }
};

module.exports = scrapeController;