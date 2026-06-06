const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  try {
    const vm = require('vm');
    new vm.Script(match[1]);
    console.log(`Script ${count} parsed successfully.`);
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.log(`SyntaxError in script ${count}: ${e.message}`);
      // Find exact line
      const lines = html.substring(0, match.index).split('\n').length;
      console.log(`Error starts around line: ${lines}`);
      console.log(e.stack);
    }
  }
}
