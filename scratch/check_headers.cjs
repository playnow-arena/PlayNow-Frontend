const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, data: data.substring(0, 500) }));
    }).on('error', reject);
  });
}

async function verify() {
  try {
    const { data } = await fetchUrl('https://playnowarena.in');
    const cssMatch = data.match(/href="\/assets\/([^"]+\.css)"/);
    if (cssMatch) {
      const cssUrl = `https://www.playnowarena.in/assets/${cssMatch[1]}`;
      const cssRes = await fetchUrl(cssUrl);
      console.log(`CSS Headers:`, cssRes.headers);
      console.log(`CSS First 500 bytes:`, cssRes.data);
    } else {
      console.log("No CSS link found in index.html");
    }
  } catch (err) {
    console.error("Error fetching:", err);
  }
}

verify();
