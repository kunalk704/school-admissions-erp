const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf-8');
const regex = /<h4[^>]*>([^<]+)<\/h4>/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const fullTag = match[0];
  const classNameMatch = fullTag.match(/className=\"([^\"]+)\"/);
  const className = classNameMatch ? classNameMatch[1] : '';
  const text = match[1].trim();
  console.log('Text:', text, '| Classes:', className);
}
