const fs = require('fs');
const yaml = require('js-yaml')


let fileContents = fs.readFileSync('ledger.yaml', 'utf8');
let ledger = yaml.load(fileContents);
console.log(ledger)