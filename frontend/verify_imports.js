const fs = require('fs');
const path = require('path');

const appPath = 'src/App.jsx';
try {
    const content = fs.readFileSync(appPath, 'utf8');
    const regex = /import\s*\(\s*["']\.\/([^"']+)["']\s*\)/g;
    const missing = [];
    const found = [];

    let match;
    while ((match = regex.exec(content)) !== null) {
        const relPath = match[1];
        // Extensions to check
        const extensions = ['.jsx', '.js', '.tsx', '.ts'];
        let exists = false;

        // Check if it's a file
        for (const ext of extensions) {
            const fullPath = path.join('src', relPath + ext);
            if (fs.existsSync(fullPath)) {
                exists = true;
                break;
            }
        }

        // Check if it's a directory (index.jsx/js)
        if (!exists) {
            for (const ext of extensions) {
                const indexFullPath = path.join('src', relPath, 'index' + ext);
                if (fs.existsSync(indexFullPath)) {
                    exists = true;
                    break;
                }
            }
        }

        if (!exists) {
            missing.push(relPath);
        } else {
            found.push(relPath);
        }
    }

    console.log('Total imports found:', found.length + missing.length);
    console.log('Missing files:', missing);
    if (missing.length > 0) {
        process.exit(1);
    }
} catch (err) {
    console.error(err);
}
