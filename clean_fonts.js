const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./client/src');
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Completely remove ANY fontFamily declaration
    let newContent = content.replace(/fontFamily\s*:\s*(['"`])[^\1]*?\1/g, '');
    
    // Clean up empty commas
    newContent = newContent.replace(/,\s*,/g, ',');
    newContent = newContent.replace(/\{\s*,/g, '{');
    newContent = newContent.replace(/,\s*\}/g, '}');

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedFiles++;
        console.log(`Removed fontFamily in ${file}`);
    }
});

console.log(`Total files fixed: ${changedFiles}`);
