const url = require('url');

const address = 'http://localhost:8080/default.htm?year=2024&month=april';
console.log(`Original URL: ${address}\n`);

// 1. Using the legacy url.parse (often used in practical combinations)
console.log('--- 1. Using legacy url.parse() ---');
const parsed = url.parse(address, true);
console.log(`Hostname: ${parsed.hostname}`);
console.log(`Pathname: ${parsed.pathname}`);
console.log(`Search Query object:`, parsed.query);
console.log(`Year from query: ${parsed.query.year}`);

// 2. Using the modern WHATWG URL API (Recommended approach)
console.log('\n--- 2. Using Modern URL API ---');
const modernUrl = new URL(address);
console.log(`Hostname: ${modernUrl.hostname}`);
console.log(`Pathname: ${modernUrl.pathname}`);
console.log(`Search Params: year=${modernUrl.searchParams.get('year')}, month=${modernUrl.searchParams.get('month')}`);

// 3. Using url.format to construct a URL
console.log('\n--- 3. Using url.format() ---');
const formattedUrl = url.format({
    protocol: 'https',
    hostname: 'example.com',
    pathname: '/some/path',
    query: {
        page: 1,
        limit: 10
    }
});
console.log(`Formatted URL: ${formattedUrl}`);
