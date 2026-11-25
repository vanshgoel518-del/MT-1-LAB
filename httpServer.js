import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDirectory = path.join(__dirname, 'screenshots');

const employees = [
  { id: 1, name: 'Rahul Sharma', employeeId: 'EMP101', department: 'IT', salary: 45000 },
  { id: 2, name: 'Priya Patel', employeeId: 'EMP102', department: 'HR', salary: 42000 },
  { id: 3, name: 'Amit Kumar', employeeId: 'EMP103', department: 'Finance', salary: 48000 },
];

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload, null, 2));
}

function isValidEmployee(employee) {
  return employee !== null
    && typeof employee === 'object'
    && !Array.isArray(employee)
    && Number.isInteger(employee.id)
    && employee.id > 0
    && typeof employee.name === 'string'
    && employee.name.trim() !== ''
    && typeof employee.employeeId === 'string'
    && employee.employeeId.trim() !== ''
    && typeof employee.department === 'string'
    && employee.department.trim() !== ''
    && typeof employee.salary === 'number'
    && Number.isFinite(employee.salary)
    && employee.salary >= 0;
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  const maximumSize = 1024 * 1024;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maximumSize) {
      const error = new Error('Request body is too large.');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Request body must contain valid JSON.');
    error.statusCode = 400;
    throw error;
  }
}

async function serveScreenshot(request, response, pathname) {
  const encodedName = pathname.slice('/screenshots/'.length);
  let fileName;

  try {
    fileName = decodeURIComponent(encodedName);
  } catch {
    sendJson(response, 400, { message: 'Invalid file name.' });
    return;
  }

  // Only serve files directly inside screenshots/, preventing path traversal.
  if (!fileName || path.basename(fileName) !== fileName) {
    sendJson(response, 400, { message: 'Invalid file name.' });
    return;
  }

  const filePath = path.join(screenshotsDirectory, fileName);
  try {
    const file = await fs.promises.readFile(filePath);
    const contentTypes = {
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.js': 'text/javascript; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    };
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(fileName).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': file.length,
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(file);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'EISDIR') {
      sendJson(response, 404, { message: 'Screenshot file not found.' });
      return;
    }
    console.error('Could not read screenshot file:', error);
    sendJson(response, 500, { message: 'Could not read the requested file.' });
  }
}

const server = http.createServer(async (request, response) => {
  let pathname;
  try {
    pathname = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`).pathname;
  } catch {
    sendJson(response, 400, { message: 'Invalid request URL.' });
    return;
  }

  if (request.method === 'GET' && pathname === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(`<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Employee Management</title></head>
  <body>
    <h1>Welcome to the Employee Management Application</h1>
    <p>HTTP module practical server is running.</p>
    <ul>
      <li><a href="/employees">View employees (JSON)</a></li>
      <li><a href="/about">About this application</a></li>
    </ul>
  </body>
</html>`);
    return;
  }

  if (request.method === 'GET' && pathname === '/employees') {
    sendJson(response, 200, employees);
    return;
  }

  if (request.method === 'GET' && pathname === '/about') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>About</title></head><body><h1>About</h1><p>Employee Management application built with the Node.js HTTP and FS modules.</p><p>HTTP server port: 3000</p><p>Employee data is stored in a JavaScript array while the server is running.</p></body></html>');
    return;
  }

  if (request.method === 'POST' && pathname === '/add-employee') {
    if (!request.headers['content-type']?.toLowerCase().includes('application/json')) {
      sendJson(response, 415, { message: 'Content-Type must be application/json.' });
      return;
    }

    try {
      const employee = await readJsonBody(request);
      if (!isValidEmployee(employee)) {
        sendJson(response, 400, {
          message: 'Provide id (positive integer), name, employeeId, department (non-empty strings), and salary (non-negative number).',
        });
        return;
      }
      if (employees.some((item) => item.id === employee.id)) {
        sendJson(response, 409, { message: `An employee with id ${employee.id} already exists.` });
        return;
      }
      employees.push({
        id: employee.id,
        name: employee.name.trim(),
        employeeId: employee.employeeId.trim(),
        department: employee.department.trim(),
        salary: employee.salary,
      });
      sendJson(response, 201, { message: 'Employee added successfully.', employee: employees.at(-1) });
    } catch (error) {
      sendJson(response, error.statusCode ?? 400, { message: error.message ?? 'Invalid request.' });
    }
    return;
  }

  if (request.method === 'GET' && pathname.startsWith('/screenshots/')) {
    await serveScreenshot(request, response, pathname);
    return;
  }

  sendJson(response, 404, { message: 'Route not found.' });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
  console.log('Static files in screenshots/ are available at /screenshots/<filename>.');
});
