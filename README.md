# MT1-LABEXAM - Employee Management

Full Stack Development lab practical using Node.js `http`, `fs`, and Express. Both servers keep employee records in in-memory JavaScript arrays; data resets when a server restarts.

## Requirements

- Node.js 18 or later
- npm

## Setup

```bash
npm install
```

## Run the Node.js HTTP server (Part A)

```bash
npm run start:http
```

It runs at `http://localhost:3000`.

| Method | URL | Description |
| --- | --- | --- |
| GET | `/` | Welcome page in HTML |
| GET | `/employees` | Employee array in JSON |
| GET | `/about` | Application information in HTML |
| POST | `/add-employee` | Add an employee using a JSON body |
| GET | `/screenshots/<filename>` | Serve a file from the `screenshots/` folder using the FS module |

Example request for `POST /add-employee`:

```json
{
  "id": 4,
  "name": "Amit Kumar",
  "employeeId": "EMP104",
  "department": "HR",
  "salary": 38000
}
```

## Run the Express REST API (Part B)

Open a second terminal and run:

```bash
npm run start:express
```

It runs at `http://localhost:4000`.

| Method | URL | Description |
| --- | --- | --- |
| GET | `/employees` | Retrieve all employees |
| GET | `/employees/1` | Retrieve employee with ID 1 |
| POST | `/employees` | Add an employee; returns HTTP 201 |
| PUT | `/employees/1` | Replace employee 1's details |
| DELETE | `/employees/1` | Delete employee 1 |

For POST and PUT, select **Body → raw → JSON** in Postman and send an object with `name`, `employeeId`, `department`, and numeric `salary`. POST also requires a positive integer `id`. PUT uses the URL ID and updates the employee's fields.

## Screenshots for submission

Save your own demonstration screenshots in `screenshots/`. The HTTP server serves them from `/screenshots/<filename>`; for example, `screenshots/http-server.png` is available at `http://localhost:3000/screenshots/http-server.png`. The folder contains a `.gitkeep` so it remains in Git until you add your screenshots.

## GitHub submission

Create a GitHub repository named `MT1-LABEXAM`, then initialize this folder as a Git repository, make the requested commits as you complete each module, and push it to that repository. The `.gitignore` excludes dependencies, secrets, logs, editor files, and generated output.
