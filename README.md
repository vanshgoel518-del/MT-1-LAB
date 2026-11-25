# MT1-LABEXAM - Employee Management

## Setup
1. Open this folder in VS Code.
2. Run `npm install`.
3. Run Part A: `node httpServer.js` (port 3000).
4. Run Part B in a separate terminal: `node expressApp.js` (port 4000).

## Part A URLs
- GET `http://localhost:3000/`
- GET `http://localhost:3000/employees`
- GET `http://localhost:3000/about`
- POST `http://localhost:3000/add-employee`

## Part B Express API (port 4000)
- GET `/employees`
- GET `/employees/:id`
- POST `/employees`
- PUT `/employees/:id`
- DELETE `/employees/:id`

Employee JSON:
```json
{
  "id": 4,
  "name": "Amit Kumar",
  "employeeId": "EMP104",
  "department": "HR",
  "salary": 38000
}
```
