const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`Redirecting from ${url} to ${res.headers.location}...`);
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function verify() {
  console.log("Fetching https://playnowarena.in ...");
  try {
    const { statusCode, data } = await fetchUrl('https://playnowarena.in');
    console.log("index.html HTTP Status:", statusCode);
    
    // Find CSS
    const cssMatch = data.match(/href="\/assets\/([^"]+\.css)"/);
    if (cssMatch) {
      const cssUrl = `https://www.playnowarena.in/assets/${cssMatch[1]}`;
      console.log(`\nFound CSS URL: ${cssUrl}`);
      const cssRes = await fetchUrl(cssUrl);
      console.log(`CSS HTTP Status: ${cssRes.statusCode}`);
    } else {
      console.log("\nNo CSS link found in index.html");
    }

    // Find JS
    const jsMatch = data.match(/src="\/assets\/([^"]+\.js)"/);
    if (jsMatch) {
      const jsUrl = `https://www.playnowarena.in/assets/${jsMatch[1]}`;
      console.log(`\nFound JS URL: ${jsUrl}`);
      const jsRes = await fetchUrl(jsUrl);
      console.log(`JS HTTP Status: ${jsRes.statusCode}`);
    } else {
      console.log("\nNo JS link found in index.html");
    }
  } catch (err) {
    console.error("Error fetching:", err);
  }
}

verify();
