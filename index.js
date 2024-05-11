const fs = require("node:fs");
const axios = require("axios");
const cheerio = require("cheerio");
const xlsx = require('xlsx');

const url = "https://www.fnp.com/gifts/birthday-lp?promo=desk_top_icon_pos_1";

async function getPageData(url) {
    try {
        const response = await axios.get(url);
        const data = JSON.stringify(response.data);
        fs.writeFileSync('pagedata.txt', data);
    } catch(err) {
        console.log("ERROR OCCURED:", err);
    }
}

function readPageData () {
    const strData = fs.readFileSync('./pagedata.txt', { encoding: 'utf-8' });
    return strData;
}

const pageHTMLData = readPageData();
const $ = cheerio.load(pageHTMLData);

function fillDataArr() {
    const dataArr = [];

    const dataCards = $('div.MuiGrid-root.jss18.MuiGrid-container.MuiGrid-spacing-xs-1').find('div.product-card_product-info__2G6yk');
    dataCards.each((idx,ele) => {
        const productName = $(ele).find('div.product-card_product-title__32LFp').text();
        const price = $(ele).find('span.product-card_product-price-info__17tj7').text();
        const rating = $(ele).find('span.product-card_rating-sec__34VZH').text() === "" ? "0.00" : $(ele).find('span.product-card_rating-sec__34VZH').text();
        dataArr.push(
            {
                PRODUCT: productName,
                PRICE: price,
                RATING: rating.substring(0,3),
            }
        )
    })
    
    return dataArr;
}

const dataArr = fillDataArr();


const workbook = xlsx.utils.book_new();
const worksheet = xlsx.utils.json_to_sheet(dataArr);

xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
xlsx.writeFile(workbook, "products.xlsx");


// getPageData(url);
