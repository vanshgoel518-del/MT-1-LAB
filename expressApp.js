import express from 'express';

const app = express();
const PORT = 4000;

app.use(express.json({ limit: '1mb' }));

const employees = [
  { id: 1, name: 'Rahul Sharma', employeeId: 'EMP101', department: 'IT', salary: 45000 },
  { id: 2, name: 'Priya Patel', employeeId: 'EMP102', department: 'HR', salary: 42000 },
  { id: 3, name: 'Amit Kumar', employeeId: 'EMP103', department: 'Finance', salary: 48000 },
];

const requiredFields = ['id', 'name', 'employeeId', 'department', 'salary'];

function validateEmployee(employee, { requireId = true } = {}) {
  if (employee === null || typeof employee !== 'object' || Array.isArray(employee)) {
    return 'Request body must be a JSON object.';
  }

  if (requireId && (!Number.isInteger(employee.id) || employee.id <= 0)) {
    return 'id must be a positive integer.';
  }
  if (typeof employee.name !== 'string' || !employee.name.trim()) {
    return 'name must be a non-empty string.';
  }
  if (typeof employee.employeeId !== 'string' || !employee.employeeId.trim()) {
    return 'employeeId must be a non-empty string.';
  }
  if (typeof employee.department !== 'string' || !employee.department.trim()) {
    return 'department must be a non-empty string.';
  }
  if (typeof employee.salary !== 'number' || !Number.isFinite(employee.salary) || employee.salary < 0) {
    return 'salary must be a non-negative number.';
  }

  return null;
}

function cleanEmployee(employee) {
  return {
    id: employee.id,
    name: employee.name.trim(),
    employeeId: employee.employeeId.trim(),
    department: employee.department.trim(),
    salary: employee.salary,
  };
}

function parseEmployeeId(rawId, response) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    response.status(400).json({ message: 'Employee id must be a positive integer.' });
    return null;
  }
  return id;
}

app.get('/', (request, response) => {
  response.type('html').send('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Employee REST API</title></head><body><h1>Employee Management REST API</h1><p>Use /employees to view employee records.</p></body></html>');
});

app.get('/employees', (request, response) => {
  response.status(200).json(employees);
});

app.get('/employees/:id', (request, response) => {
  const id = parseEmployeeId(request.params.id, response);
  if (id === null) return;

  const employee = employees.find((item) => item.id === id);
  if (!employee) {
    response.status(404).json({ message: `Employee with id ${id} was not found.` });
    return;
  }
  response.status(200).json(employee);
});

app.post('/employees', (request, response) => {
  const validationError = validateEmployee(request.body);
  if (validationError) {
    response.status(400).json({ message: validationError, requiredFields });
    return;
  }

  const employee = cleanEmployee(request.body);
  if (employees.some((item) => item.id === employee.id)) {
    response.status(409).json({ message: `Employee with id ${employee.id} already exists.` });
    return;
  }

  employees.push(employee);
  response.status(201).json({ message: 'Employee added successfully', employee });
});

app.put('/employees/:id', (request, response) => {
  const id = parseEmployeeId(request.params.id, response);
  if (id === null) return;

  const employeeIndex = employees.findIndex((item) => item.id === id);
  if (employeeIndex === -1) {
    response.status(404).json({ message: `Employee with id ${id} was not found.` });
    return;
  }

  const validationError = validateEmployee(request.body, { requireId: false });
  if (validationError) {
    response.status(400).json({ message: validationError });
    return;
  }

  const updatedEmployee = cleanEmployee({ ...request.body, id });
  employees[employeeIndex] = updatedEmployee;
  response.status(200).json({ message: 'Employee updated successfully.', employee: updatedEmployee });
});

app.delete('/employees/:id', (request, response) => {
  const id = parseEmployeeId(request.params.id, response);
  if (id === null) return;

  const employeeIndex = employees.findIndex((item) => item.id === id);
  if (employeeIndex === -1) {
    response.status(404).json({ message: `Employee with id ${id} was not found.` });
    return;
  }

  const [deletedEmployee] = employees.splice(employeeIndex, 1);
  response.status(200).json({ message: 'Employee deleted successfully.', employee: deletedEmployee });
});

app.use((request, response) => {
  response.status(404).json({ message: 'Route not found.' });
});

app.use((error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({ message: 'Request body must contain valid JSON.' });
    return;
  }
  if (error.type === 'entity.too.large') {
    response.status(413).json({ message: 'Request body is too large.' });
    return;
  }
  console.error(error);
  response.status(500).json({ message: 'An unexpected server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
