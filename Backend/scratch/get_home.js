const http = require('http');

http.get('http://localhost:5000/api/user/home', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('API Response Keys:', Object.keys(json));
      console.log('carePlan exists:', !!json.carePlan);
      console.log('whyChoose exists:', !!json.whyChoose);
      console.log('howItWorks exists:', !!json.howItWorks);
      if (json.carePlan) {
        console.log('carePlan details:', JSON.stringify(json.carePlan, null, 2));
      }
    } catch (err) {
      console.log('Parsing error:', err.message);
      console.log('Data:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.log('HTTP Error:', err.message);
});
