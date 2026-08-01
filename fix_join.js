const fs = require('fs');
let code = fs.readFileSync('src/compiler/core/promptAssembler.ts', 'utf8');
code = code.replace(/\.join\("[\s\S]*?"\)/, '.join("\\n")');
fs.writeFileSync('src/compiler/core/promptAssembler.ts', code);
