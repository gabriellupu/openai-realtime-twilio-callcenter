import puppeteer from 'puppeteer';

// example usage
//
// (async () => {
//   const url = 'https://glovoapp.com/ro/en/brasov/pizzeria-bada-bing-brv/';
//   const menu = await extractGlovoMenu(url);
//   console.log(JSON.stringify(menu, null, 2));
// })();


const getMenuItems = (nuxtData: any) => {
    const menuItems = [];

    try {
      const sections = nuxtData.sections || [];
      for (const section of sections) {
        for (const row of section.rows || []) {
          if (row.type === 'PRODUCT_ROW' && row.data) {
            menuItems.push({
              category: section.title || 'Uncategorized',
              name: row.data.name,
              description: row.data.description,
              price: row.data.price,
              imageUrl: row.data.imageUrl,
              attributeGroups: row.data.attributeGroups?.map((group: any) => ({
                name: group.name,
                attributes: group.attributes?.map((attr: any) => ({
                  name: attr.name,
                  price: attr.priceImpact
                }))
              }))
            });
          }
        }
      }
    } catch (err) {
      console.error('Error parsing menu:', err);
      return null;
    }

    return menuItems;
}

const extractMenuFromStaticFile = () => {
  try {
    const menu = require('./menu_call_center_1.json');
    return menu;
  } catch (err) {
    console.error('Error loading nuxt data from file:', err);
    return null;
  }
}

async function extractGlovoMenu(url: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set headers and cookies to match the curl request
  await page.setExtraHTTPHeaders({
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'no-cache',
    'pragma': 'no-cache',
    'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate', 
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
  });

  await page.setCookie(
    { name: 'glv_device_uid', value: '2291f7dd-21dd-40e0-8a4f-47770ba4c2e9', domain: '.glovoapp.com' },
    { name: 'glovo_last_visited_city', value: 'BRV', domain: '.glovoapp.com' },
    { name: 'glovo_user_lang', value: 'en', domain: '.glovoapp.com' },
    { name: 'layout_mode', value: 'light', domain: '.glovoapp.com' },
    { name: 'i18next', value: 'en', domain: '.glovoapp.com' }
  );

  await page.goto(url, {
    waitUntil: 'networkidle0',
    timeout: 0,
    referer: 'https://www.google.com/'
  });

  // Evaluate the page context to extract window.__NUXT__ content
  const menuData = await page.evaluate(() => {
    console.log("Evaluating page context");
    // Get the full HTML content of the page
    const html = document.documentElement.outerHTML;
    console.log("Page HTML:", html);
    const nuxtData = (window as any).__NUXT__;
    if (!nuxtData) return null;

    return getMenuItems(nuxtData);
  });

  await browser.close();
  return menuData;
}

export { extractMenuFromStaticFile, extractGlovoMenu };
