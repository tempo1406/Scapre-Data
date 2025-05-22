const scrapeCategory = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let page = await browser.newPage();
        console.log("Mở tab mới");
        await page.goto(url);
        console.log("Đã vào trang " + url);
        await page.waitForSelector('.nav.nav-list'); // Chờ danh sách category
        console.log("Đã load xong trang " + url);

        // Lấy danh sách category
        const categories = await page.$$eval('.nav.nav-list > li > ul > li', els => {
            return els.map(el => ({
                category: el.querySelector('a').innerText.trim(),
                link: el.querySelector('a').href
            }));
        });

        console.log("Đã lấy được danh sách category: ", categories);

        // Scrape từng category và lưu vào object
        const booksByCategory = {};
        for (const category of categories) {
            console.log(`Đang scrape category: ${category.category}`);
            const books = await scrapeBooksInCategory(browser, category.link, category.category);
            booksByCategory[category.category] = books; // Lưu sách theo category
        }

        await page.close();
        resolve(booksByCategory); // Trả về object chứa sách theo category
    } catch (error) {
        console.log("Lỗi ở scrape category: ", error);
        reject(error);
    }
});

// Hàm scrape sách trong một category
const scrapeBooksInCategory = async (browser, categoryUrl, categoryName) => {
    const books = [];
    let page = await browser.newPage();
    try {
        await page.goto(categoryUrl);
        console.log(`Đã vào trang category: ${categoryUrl}`);

        // Lặp qua các trang trong category (xử lý pagination)
        while (true) {
            await page.waitForSelector('.product_pod'); // Chờ danh sách sách

            // Lấy danh sách sách trên trang hiện tại
            const bookLinks = await page.$$eval('.product_pod h3 a', els => els.map(el => el.href));

            // Scrape từng sách
            for (const bookLink of bookLinks) {
                const bookData = await scrapeBookDetails(browser, bookLink, categoryName);
                books.push(bookData);
            }

            // Kiểm tra có trang tiếp theo không
            const nextPage = await page.$('.next a');
            if (!nextPage) break;

            const nextPageUrl = await page.$eval('.next a', el => el.href);
            await page.goto(nextPageUrl);
            console.log(`Chuyển sang trang tiếp theo: ${nextPageUrl}`);
        }

        await page.close();
        return books;
    } catch (error) {
        console.log(`Lỗi khi scrape category ${categoryName}: `, error);
        await page.close();
        return books;
    }
};

// Hàm scrape chi tiết một sách
const scrapeBookDetails = async (browser, bookUrl, categoryName) => {
    let page = await browser.newPage();
    try {
        await page.goto(bookUrl);
        await page.waitForSelector('.product_page'); // Chờ trang chi tiết sách

        const bookData = await page.evaluate(() => {
            const title = document.querySelector('h1')?.innerText || '';
            const price = document.querySelector('.price_color')?.innerText || '';
            const availability = document.querySelector('.instock.availability')?.innerText.trim() || '';
            const imageUrl = document.querySelector('.thumbnail img')?.src || '';
            const description = document.querySelector('#product_description ~ p')?.innerText || '';
            const upc = document.querySelector('.table.table-striped tr:nth-child(1) td')?.innerText || '';

            return { title, price, availability, imageUrl, description, upc };
        });

        console.log(`Đã scrape sách: ${bookData.title}`);
        await page.close();
        return { ...bookData, category: categoryName };
    } catch (error) {
        console.log(`Lỗi khi scrape sách ${bookUrl}: `, error);
        await page.close();
        return { category: categoryName, error: error.message };
    }
};

module.exports = scrapeCategory;