const http = require('http');
const fs = require('fs');
const path = require('path');

let employees = [
  { id: 1, name: 'Rahul Sharma', employeeId: 'EMP101', department: 'IT', salary: 45000 },
  { id: 2, name: 'Amit Kumar', employeeId: 'EMP102', department: 'HR', salary: 38000 },
  { id: 3, name: 'Priya Singh', employeeId: 'EMP103', department: 'Sales', salary: 40000 }
];

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Unable to read index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  }
  else if (req.url === '/employees' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(employees));
  }
  else if (req.url === '/about' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Employee Management Application</h1><p>Built with Node.js HTTP and FS modules.</p>');
  }
  else if (req.url === '/add-employee' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const newEmployee = JSON.parse(body);
        const required = ['id', 'name', 'employeeId', 'department', 'salary'];
        if (required.some(key => newEmployee[key] === undefined || newEmployee[key] === null || newEmployee[key] === '')) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Missing required employee fields: id, name, employeeId, department, salary' }));
          return;
        }
        if (employees.some(emp => emp.id === Number(newEmployee.id))) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Employee ID already exists' }));
          return;
        }
        employees.push(newEmployee);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Employee added successfully', employee: newEmployee }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON data' }));
      }
    });
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Page Not Found</h1>');
  }
});

server.listen(3000, () => {
  console.log('HTTP Server running at http://localhost:3000');
});
