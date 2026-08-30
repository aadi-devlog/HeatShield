const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('C:\\Users\\as598\\.gemini\\antigravity\\brain\\3c283518-4cde-4486-99e8-bf4bbc343538\\.system_generated\\steps\\387\\content.md', 'utf8');
const $ = cheerio.load(html);
$('script, style').remove();
const text = $('body').text().replace(/\s+/g, ' ');

const keywords = ['collaborator', 'github', 'repo', 'invite', 'permission', 'aadi-devlog'];
const sentences = text.split(/[.!?]/);

const matches = sentences.filter(s => keywords.some(k => s.toLowerCase().includes(k)));
console.log('Matches found in Webpage:');
matches.forEach(m => console.log('- ' + m.trim()));
