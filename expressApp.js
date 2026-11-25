const express = require('express');
const app = express();
app.use(express.json());

let employees = [
  { id: 1, name: 'Rahul Sharma', employeeId: 'EMP101', department: 'IT', salary: 45000 },
  { id: 2, name: 'Amit Kumar', employeeId: 'EMP102', department: 'HR', salary: 38000 },
  { id: 3, name: 'Priya Singh', employeeId: 'EMP103', department: 'Sales', salary: 40000 }
];

// GET all employees
app.get('/employees', (req, res) => {
  res.status(200).json(employees);
});

// GET employee by ID
app.get('/employees/:id', (req, res) => {
  const employee = employees.find(emp => emp.id === Number(req.params.id));
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.status(200).json(employee);
});

// POST add employee
app.post('/employees', (req, res) => {
  const newEmployee = req.body;
  const required = ['id', 'name', 'employeeId', 'department', 'salary'];
  if (!newEmployee || required.some(key => newEmployee[key] === undefined || newEmployee[key] === null || newEmployee[key] === '')) {
    return res.status(400).json({ message: 'All employee fields are required' });
  }
  if (employees.some(emp => emp.id === Number(newEmployee.id))) {
    return res.status(409).json({ message: 'Employee ID already exists' });
  }
  employees.push(newEmployee);
  res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
});

// PUT update employee
app.put('/employees/:id', (req, res) => {
  const index = employees.findIndex(emp => emp.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Employee not found' });

  const updated = req.body;
  const required = ['name', 'employeeId', 'department', 'salary'];
  if (!updated || required.some(key => updated[key] === undefined || updated[key] === null || updated[key] === '')) {
    return res.status(400).json({ message: 'name, employeeId, department and salary are required' });
  }

  employees[index] = { id: employees[index].id, ...updated };
  res.status(200).json({ message: 'Employee updated successfully', employee: employees[index] });
});

// DELETE employee
app.delete('/employees/:id', (req, res) => {
  const index = employees.findIndex(emp => emp.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Employee not found' });
  const removed = employees.splice(index, 1)[0];
  res.status(200).json({ message: 'Employee deleted successfully', employee: removed });
});

// Invalid route
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Invalid JSON handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON request body' });
  }
  next(err);
});

app.listen(4000, () => {
  console.log('Express Server running at http://localhost:4000');
});
