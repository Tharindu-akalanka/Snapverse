const fs = require('fs');
const path = require('path');

const albumsFilePath = path.join(__dirname, 'data/albums.ts');
let content = fs.readFileSync(albumsFilePath, 'utf-8');

const basePath = path.join(__dirname, 'public/Images/Soucre images');

const imgsRegex = /imgs\("([^"]+)",\s*\[([^\]]+)\]\)/g;

let updatedContent = content;

let match;
while ((match = imgsRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const folder = match[1];
    const filesStr = match[2];

    const fileRegex = /"([^"]+)"|'([^']+)'|`([^`]+)`/g;
    let fileMatch;
    let missingFiles = [];

    while ((fileMatch = fileRegex.exec(filesStr)) !== null) {
        const file = fileMatch[1] || fileMatch[2] || fileMatch[3];
        const fullPath = path.join(basePath, folder, file);
        if (!fs.existsSync(fullPath)) {
            missingFiles.push(file);
        }
    }

    if (missingFiles.length > 0) {
        let newFilesStr = filesStr;
        missingFiles.forEach(missing => {
            // Remove `"missing.webp", ` or `"missing.webp"` 
            const replaceRegex = new RegExp(`['"\`]?${missing}['"\`]?\\s*,?\\s*`, 'g');
            newFilesStr = newFilesStr.replace(replaceRegex, '');
        });

        // reconstruct the imgs call
        const newImgsCall = `imgs("${folder}", [${newFilesStr}])`;
        updatedContent = updatedContent.replace(fullMatch, newImgsCall);
        console.log(`Cleaned missing files from ${folder}`);
    }
}

fs.writeFileSync(albumsFilePath, updatedContent);
console.log("Successfully cleaned albums.ts");
