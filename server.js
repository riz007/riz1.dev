const http = require('http');
const fs = require('fs');
const path = require('path');
const { promises: fsPromises } = require('fs');

const PORT = 3000;
const postsDir = path.join(__dirname, 'posts');

const spaRoutes = ['/', '/blog', '/dsa', '/useful-links'];

if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir);
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = requestUrl.pathname;
    const postUrlRegex = /^\/api\/posts\/(.+)\.md$/;
    const postMatch = pathname.match(postUrlRegex);

    if (postMatch) {
        const fileName = postMatch[1] + '.md';
        if (fileName.includes('..') || fileName.includes('/')) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid file name');
            return;
        }
        const filePath = path.join(postsDir, fileName);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Post not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/markdown' });
            res.end(data);
        });
    } else if (pathname === '/api/posts') {
        try {
            const files = await fsPromises.readdir(postsDir);
            const markdownFiles = files.filter(file => file.endsWith('.md'));
            const posts = await Promise.all(
                markdownFiles.map(async (file) => {
                    const filePath = path.join(postsDir, file);
                    const content = await fsPromises.readFile(filePath, 'utf8');
                    let title = file.replace(/\.md$/, '').replace(/-/g, ' ');
                    let date = 'No date';
                    const titleMatch = content.match(/^#\s+(.*)/m);
                    if (titleMatch && titleMatch[1]) { title = titleMatch[1]; }
                    const dateMatch = content.match(/\*Published on (.*?)\*/);
                    if (dateMatch && dateMatch[1]) { date = dateMatch[1]; }
                    return { date, title, file };
                })
            );
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(posts));
        } catch (dirError) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Failed to read posts directory');
        }
    } else if (pathname === '/links.json') {
        fs.readFile(path.join(__dirname, 'links.json'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Failed to read links.json');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    } 
    else if (spaRoutes.includes(pathname) || pathname.startsWith('/blog/')) {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
    else {
        const filePath = path.join(__dirname, pathname);
        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                    return;
                }
                res.writeHead(200);
                res.end(data);
            });
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});