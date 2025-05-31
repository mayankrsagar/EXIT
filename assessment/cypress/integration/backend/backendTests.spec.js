// // cypress/integration/backend/backendTests.spec.js

// describe("Backend API Tests for Employee and Admin Role", () => {
//   const apiUrl = "https://exit-kxgu.onrender.com/api";
//   let employeeResignationId = null;

//   // 1. Generate a unique employee username, email, and a ≥6‐char password
//   const timestamp = Date.now();
//   const employeeUsername = `emp${timestamp}`;            // alphanumeric only
//   const employeeEmail = `emp${timestamp}@example.com`;
//   const employeePassword = "emp1234";                     // ≥6 chars

//   // 1) Register a new employee
//   it("should register a new employee", () => {
//     cy.request("POST", `${apiUrl}/auth/register`, {
//       username: employeeUsername,
//       email: employeeEmail,
//       password: employeePassword,
//     }).then((response) => {
//       expect(response.status).to.eq(201);
//       expect(response.body).to.have.property(
//         "message",
//         "User registered successfully"
//       );
//     });
//   });

//   // 2) Login the employee (using email + password)
//   it("should login the employee with valid credentials", () => {
//     cy.request("POST", `${apiUrl}/auth/login`, {
//       email: employeeEmail,
//       password: employeePassword,
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       expect(response.body).to.have.property("token");

//       // Store the raw token (no "Bearer " prefix)
//       Cypress.env("employeeAuthToken", response.body.token);
//     });
//   });

//   // 3) Submit resignation for the logged‐in employee
//   it("should submit resignation for an employee", () => {
//     const token = Cypress.env("employeeAuthToken");

//     cy.request({
//       method: "POST",
//       url: `${apiUrl}/user/resign`,
//       headers: {
//         Authorization: token,               // RAW token, no "Bearer "
//       },
//       body: {
//         intendedLastWorkingDay: "2024-12-26",                  // any valid date string
//       },
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       // Expect: { data: { resignation: { _id: "..." } } }
//       expect(response.body).to.have.nested.property("data.resignation._id");
//       employeeResignationId = response.body.data.resignation._id;
//     });
//   });

//   // 4) Login as admin (HR) with username + password
//   it("should login as admin (HR)", () => {
//     cy.request("POST", `${apiUrl}/auth/login`, {
//       username: "admin",
//       password: "admin",
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       expect(response.body).to.have.property("token");

//       Cypress.env("adminAuthToken", response.body.token);
//     });
//   });

//   // 5) View all resignations as admin
//   it("should view all resignations submitted by employees as admin", () => {
//     const token = Cypress.env("adminAuthToken");

//     cy.request({
//       method: "GET",
//       url: `${apiUrl}/admin/resignations`,
//       headers: {
//         Authorization: token,               // RAW token, no "Bearer "
//       },
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       expect(response.body.data).to.be.an("array");

//       // Confirm our previously‐created resignation is present
//       const found = response.body.data.some(
//         (r) => r._id === employeeResignationId
//       );
//       expect(found).to.be.true;
//     });
//   });

//   // 6) Approve that resignation as admin
//   it("should approve the employee’s resignation as admin", () => {
//     const token = Cypress.env("adminAuthToken");

//     cy.request({
//       method: "PUT",
//       url: `${apiUrl}/admin/conclude_resignation`,
//       headers: {
//         Authorization: token,               // RAW token
//         "Content-Type": "application/json",
//       },
//       body: {
//         resignationId: employeeResignationId,
//         approved: true,
//         intendedLastWorkingDay: "26 Dec 2024",
//       },
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       // The returned object should now have “status”: "Approved"
//       expect(response.body.data).to.have.property("status", "Approved");
//     });
//   });

//   // 7) Employee submits exit‐interview responses (using the same raw token)
//   it("should allow the employee to submit responses to exit questionnaire", () => {
//     const token = Cypress.env("employeeAuthToken");

//     cy.request({
//       method: "POST",
//       url: `${apiUrl}/user/responses`,
//       headers: {
//         Authorization: token,               // RAW token
//         "Content-Type": "application/json",
//       },
//       body: {
//         resignationId: employeeResignationId,
//         responses: [
//           {
//             questionText:
//               "What prompted you to start looking for another job?",
//             response: "Lack of career growth opportunities",
//           },
//           {
//             questionText: "Would you recommend this company to others?",
//             response: "Yes, with some reservations",
//           },
//         ],
//       },
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       // The returned object should include our resignationId
//       expect(response.body.data).to.have.property(
//         "resignationId",
//         employeeResignationId
//       );
//     });
//   });

//   // 8) Admin views all exit‐interview responses
//   it("should allow the admin to view all questionnaire responses", () => {
//     const token = Cypress.env("adminAuthToken");

//     cy.request({
//       method: "GET",
//       url: `${apiUrl}/admin/exit_responses`,
//       headers: {
//         Authorization: token,               // RAW token
//       },
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       expect(response.body.data).to.be.an("array");

//       // Check that one entry matches our resignationId and exact responses
//       const expectedResponses = [
//         {
//           questionText: "What prompted you to start looking for another job?",
//           response: "Lack of career growth opportunities",
//         },
//         {
//           questionText: "Would you recommend this company to others?",
//           response: "Yes, with some reservations",
//         },
//       ];

//       const found = response.body.data.some((item) => {
//         if (item.resignationId !== employeeResignationId) {
//           return false;
//         }
//         return (
//           Array.isArray(item.responses) &&
//           item.responses.length === expectedResponses.length &&
//           item.responses.every((resp, i) => {
//             return (
//               resp.questionText === expectedResponses[i].questionText &&
//               resp.response === expectedResponses[i].response
//             );
//           })
//         );
//       });

//       expect(found).to.be.true;
//     });
//   });
// });


// for crio test 

// cypress/integration/backendTests.spec.js
describe('Backend API Tests for Employee and Admin Role', () => {
  // Localhost configuration
 // Add at the top of your test file
const baseUrl = Cypress.env('BASE_URL') || 'http://localhost:5000';
  let employeeToken;
  let resignationId;
  let adminToken;
  const employeeUsername = `testemployee${Date.now()}`;

  it('should register a new employee', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/api/auth/register`,
      body: {
        username: employeeUsername,
        password: 'password123'
      },
      timeout: 30000 // Increase timeout for local testing
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('message', 'User registered successfully');
    });
  });

  it('should login the employee with valid credentials', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/api/auth/login`,
      body: {
        username: employeeUsername,
        password: 'password123'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token');
      employeeToken = response.body.token;
    });
  });

  it('should submit resignation for an employee', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/api/user/resign`,
      headers: {
        Authorization: employeeToken
      },
      body: {
        intendedLastWorkingDay: "2024-12-26"
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.property('resignation');
      expect(response.body.data.resignation).to.have.property('_id');
      resignationId = response.body.data.resignation._id;
    });
  });

  it('should login as admin (HR)', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/api/auth/login`,
      body: {
        username: 'admin',
        password: 'admin'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token');
      adminToken = response.body.token;
    });
  });

  it('should view all resignations submitted by employees as admin', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/api/admin/resignations`,
      headers: {
        Authorization: adminToken
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.be.an('array');
      
      // Verify our test resignation is in the list
      const testResignation = response.body.data.find(
        r => r._id === resignationId
      );
      expect(testResignation).to.exist;
    });
  });

  it('should approve the employee’s resignation as admin', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/api/admin/conclude_resignation`,
      headers: {
        Authorization: adminToken
      },
      body: {
        resignationId: resignationId,
        approved: true,
        lwd: "2024-12-26"
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.property('status', 'Approved');
    });
  });

  it('should allow the employee to submit responses to exit questionnaire', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/api/user/responses`,
      headers: {
        Authorization: employeeToken
      },
      body: {
        responses: [
          {
            questionText: "What prompted you to start looking for another job?",
            response: "Lack of career growth opportunities"
          },
          {
            questionText: "Would you recommend this company to others?",
            response: "Yes, with some reservations"
          }
        ]
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message', 'Exit interview submitted');
    });
  });

  it('should allow the admin to view all questionnaire responses', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/api/admin/exit_responses`,
      headers: {
        Authorization: adminToken
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.be.an('array');
      expect(response.body.data[0]).to.have.property('employeeId');
      expect(response.body.data[0]).to.have.property('responses').that.is.an('array');
    });
  });
});