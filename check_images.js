const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'data/albums.ts'), 'utf-8');

// A simple regex to extract all the imgs calls
const imgsRegex = /imgs\("([^"]+)",\s*\[([^\]]+)\]\)/g;

let match;
let missing = [];

const basePath = path.join(__dirname, 'public/Images/Soucre images');

while ((match = imgsRegex.exec(content)) !== null) {
    const folder = match[1];
    const filesStr = match[2];

    // Extract file names
    // regex to match strings in quotes or backticks
    const fileRegex = /"([^"]+)"|'([^']+)'|`([^`]+)`/g;
    let fileMatch;
    while ((fileMatch = fileRegex.exec(filesStr)) !== null) {
        const file = fileMatch[1] || fileMatch[2] || fileMatch[3];
        const fullPath = path.join(basePath, folder, file);
        if (!fs.existsSync(fullPath)) {
            missing.push(`${folder}/${file}`);
        }
    }
}

console.log("Missing files:");
console.log(JSON.stringify(missing, null, 2));

// Check covers
const coverRegex = /coverImage:\s*`\$\{BASE\}\/([^`]+)`/g;
while ((match = coverRegex.exec(content)) !== null) {
    const file = match[1];
    const fullPath = path.join(basePath, file);
    if (!fs.existsSync(fullPath)) {
        missing.push(`COVER: ${file}`);
    }
}
console.log("Missing covers included:");
console.log(JSON.stringify(missing, null, 2));
