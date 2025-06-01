// // cypress/integration/backend/backendTests.spec.js

// describe("Backend API Tests for Employee and Admin Role", () => {
//   const apiUrl = "https://exit-kxgu.onrender.com/api";
//   let employeeResignationId = null;

//   // Generate a unique alphanumeric username, an email, and a ≥6‐char password:
//   const timestamp = Date.now();
//   const employeeUsername = `emp${timestamp}`;            // only letters/numbers
//   const employeeEmail = `emp${timestamp}@example.com`;
//   const employeePassword = "emp1234";                     // length ≥ 6

//   /**
//    * If `response.status !== expectedStatus`, dump the entire `response` to the console
//    * and also print the JSON‐stringified body into Cypress's GUI log.
//    */
//   function logIfBadStatus(response, expectedStatus) {
//     if (response.status !== expectedStatus) {
//       // Dump the entire response object in DevTools console (⇒ “Console” tab in Cypress runner)
//       // NOTE: In a headed run, press F12 / DevTools to inspect it.
//       // console.dir(response) shows all keys (status, body, headers, redirectedToUrl, etc.)
//       // tslint:disable-next-line:no-console
//       console.dir(response);

//       // Also write a short summary into Cypress's GUI under “.log()” messages:
//       cy.log(`⬇️ [${response.status}] ${response.redirectedToUrl || response.url || "URL unknown"}`);
//       cy.log("Headers: " + JSON.stringify(response.headers, null, 2));
//       cy.log("Body:");
//       cy.log(JSON.stringify(response.body, null, 2));
//     }
//   }

//   // 1) Register a new employee
//   it("should register a new employee", () => {
//     cy.request({
//       method: "POST",
//       url: `${apiUrl}/auth/register`,
//       body: {
//         username: employeeUsername,
//         email:    employeeEmail,
//         password: employeePassword,
//       },
//       failOnStatusCode: false,
//     }).then((response) => {
//       logIfBadStatus(response, 201);
//       expect(response.status).to.eq(201);
//       expect(response.body).to.have.property("message", "User registered successfully");
//     });
//   });

//   // 2) Login the employee with valid credentials (email + password)
//   it("should login the employee with valid credentials", () => {
//     cy.request({
//       method: "POST",
//       url: `${apiUrl}/auth/login`,
//       body: {
//         email:    employeeEmail,
//         password: employeePassword,
//       },
//       failOnStatusCode: false,
//     }).then((response) => {
//       logIfBadStatus(response, 200);
//       expect(response.status).to.eq(200);
//       expect(response.body).to.have.property("token");
//       Cypress.env("employeeAuthToken", response.body.token);
//     });
//   });

//   // 3) Submit resignation for an employee
//   // cypress/integration/backend/backendTests.spec.js

// it("should submit resignation for an employee", () => {
//   const token = Cypress.env("employeeAuthToken");
//   cy.request({
//     method: "POST",
//     url:   `${apiUrl}/user/resign`,
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     body: {
//       intendedLastWorkingDay: "2026-03-11T00:00:00.000Z",
//       reason:                 "nahi jana hai"
//     },
//     failOnStatusCode: false,
//   }).then((response) => {
    
//     logIfBadStatus(response, 201);
//     expect(response.status).to.eq(201);

//     // Now the data._id is at response.body.data._id
//     expect(response.body).to.have.nested.property("data._id");

//     // Check that the returned data fields match what you sent:
//     expect(response.body.data).to.include({
//       intendedLastWorkingDay: "2026-03-11T00:00:00.000Z",
//       reason:                 "nahi jana hai",
//       status:                 "Pending",
//       exitDate:               null,
//       decidedAt:              null,
//     });
//   const newId = response.body.data._id;
//     employeeResignationId = newId;

//      Cypress.env("employeeResignationId", newId);
//   });
// });



//   // 4) Login as admin (HR) using email + password
//   it("should login as admin (HR)", () => {
//     cy.request({
//       method: "POST",
//       url: `${apiUrl}/auth/login`,
//       body: {
//         email:    "admin@example.com",
//         password: "admin",
//       },
//       failOnStatusCode: false,
//     }).then((response) => {
//       logIfBadStatus(response, 200);
//       expect(response.status).to.eq(200);
//       expect(response.body).to.have.property("token");
//       Cypress.env("adminAuthToken", response.body.token);
//     });
//   });

//   // 5) View all resignations submitted by employees as admin
//   it("should view all resignations submitted by employees as admin", () => {
//     const token = Cypress.env("adminAuthToken");
//     cy.request({
//       method: "GET",
//       url: `${apiUrl}/admin/resignations`,
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       failOnStatusCode: false,
//     }).then((response) => {
//       logIfBadStatus(response, 200);
//       expect(response.status).to.eq(200);
//       expect(response.body.data).to.be.an("array");

//       const found = response.body.data.some(
//         (r) => r._id === employeeResignationId
//       );
//       expect(found).to.be.true;
//     });
//   });

//   // 6) Approve the employee’s resignation as admin
//   it("should approve the employee’s resignation as admin", () => {
//   const token = Cypress.env("adminAuthToken");

//   cy.request({
//     method: "PUT",
//     url:   `${apiUrl}/admin/conclude_resignation`,
//     headers: {
//       Authorization: `Bearer ${token}`,
//       // Cypress will set “Content-Type” for you, so you can omit it here
//     },
//     body: {
//       resignationId:          employeeResignationId,
//       approved:               true,
//       // Use exactly the same date‐string format you verified in Postman:
//       intendedLastWorkingDay: "2026-03-11",
//       exitDate:               "2028-10-11"
//     },
//     failOnStatusCode: false,
//   }).then((response) => {
//     // dump the entire response to console first, so you can see any validation errors:
//     console.log("PUT /applicate→admin/conclude_resignation RESP:", response);

//     // Now assert that server returns 200 OK
//     logIfBadStatus(response, 200);
//     expect(response.status).to.eq(200);
// Cypress.env("employeeResignationId", response.body.data._id);
//     // Finally check that “status” has been updated to “Approved”:
//     expect(response.body.data).to.have.property("status", "Approved");
//   });
// });


//   // 7) Employee completes the exit‐interview
//  it("should allow the employee to submit responses to exit questionnaire", () => {
//   const token = Cypress.env("employeeAuthToken");
//   const resignationId = Cypress.env("employeeResignationId");

//   cy.request({
//     method: "POST",
//     url: `${apiUrl}/user/responses`,
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: {
//       resignationId,
//       responses: [
//         {
//           questionText: "What prompted you to start looking for another job?",
//           response: "Lack of career growth opportunities",
//         },
//         {
//           questionText: "Would you recommend this company to others?",
//           response: "Yes, with some reservations",
//         },
//       ],
//     },
//     failOnStatusCode: false,
//   }).then((response) => {
//     logIfBadStatus(response, 200); 
//     expect(response.status).to.eq(200); 
//     expect(response.body).to.have.property("message", "Exit interview submitted");

//     const { data } = response.body;
//     expect(data).to.have.property("resignation", resignationId); // ✅ Adjust based on actual key
//     expect(data).to.have.property("employee"); // just checking existence
//     expect(data.responses).to.be.an("array").and.have.length(2);
//   });
// });

//   // 8) Admin views all exit‐interview responses
// it("should allow the admin to view all questionnaire responses", () => {
//   const token = Cypress.env("adminAuthToken");
//   cy.request({
//     method: "GET",
//     url: `${apiUrl}/admin/exit_responses`,
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   }).then((response) => {
//     expect(response.status).to.eq(200);
//     expect(response.body.data).to.be.an("array");

//     const expected = [
//       {
//         questionText: "What prompted you to start looking for another job?",
//         response: "Lack of career growth opportunities",
//       },
//       {
//         questionText: "Would you recommend this company to others?",
//         response: "Yes, with some reservations",
//       },
//     ];

//     // Get employee ID from resignation record
//     const employeeId = Cypress.env('employeeId');
    
//     // Find responses for this employee
//     const employeeResponses = response.body.data.find(
//       item => item.employeeId === employeeId
//     );

//     // Verify responses exist for this employee
//     expect(employeeResponses, `Responses for employee ${employeeId} not found`).to.exist;
    
//     // Verify response content
//     expected.forEach((exp, index) => {
//       expect(employeeResponses.responses[index]).to.include(exp);
//     });
//   });
// });
// });


//for test only

// cypress/integration/backend/backendTests.spec.js

describe("Backend API Tests for Employee and Admin Role", () => {
  const apiUrl = "https://exit-kxgu.onrender.com/api";
  let employeeResignationId = null;

  // (1) Generate a unique alphanumeric username + email + ≥6‐char password
  const timestamp        = Date.now();
  const employeeUsername = `emp${timestamp}`;
  const employeeEmail    = `emp${timestamp}@example.com`;
  const employeePassword = "emp1234";

  // Helper: log and throw if status ≠ expected
  function logIfBadStatus(res, expectedStatus) {
    if (res.status !== expectedStatus) {
      // Print the entire response body so you can see exactly what the server sent back
      // (including any “error” messages or validation failures).
      console.log(
        `\n→ Unexpected status: expected ${expectedStatus}, got ${res.status}:\n`,
        JSON.stringify(res.body, null, 2),
        "\n"
      );
    }
  }

  // 1) Register a new employee
  it("should register a new employee", () => {
    cy.request("POST", `${apiUrl}/auth/register`, {
      username: employeeUsername,
      email:    employeeEmail,
      password: employeePassword,
    }).then((response) => {
      logIfBadStatus(response, 201);
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property(
        "message",
        "User registered successfully"
      );
    });
  });

  // 2) Login the employee (email + password)
  it("should login the employee with valid credentials", () => {
    cy.request("POST", `${apiUrl}/auth/login`, {
      email:    employeeEmail,
      password: employeePassword,
    }).then((response) => {
      logIfBadStatus(response, 200);
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("token");

      Cypress.env("employeeAuthToken", response.body.token);
    });
  });

  // 3) Submit resignation for that employee (expects 201 Created)
  it("should submit resignation for an employee", () => {
    const token = Cypress.env("employeeAuthToken");
    cy.request({
      method: "POST",
      url:    `${apiUrl}/user/resign`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        intendedLastWorkingDay: "2026-03-11T00:00:00.000Z",
        reason:                 "nahi jana hai",
      },
      failOnStatusCode: false,
    }).then((response) => {
      // The API returns 201 on success
      logIfBadStatus(response, 201);
      expect(response.status).to.eq(201);

      // Grab the newly created resignation _id
      const newId = response.body.data._id;
      expect(newId).to.be.a("string").and.not.be.empty;

      // 1) store locally so we can reference it in this file
      employeeResignationId = newId;

      // 2) **ALSO** push it into Cypress.env(...) so later tests can read it:
      Cypress.env("employeeResignationId", newId);

      // (optional) print it to the console so you can confirm:
      console.log("▶ employeeResignationId =", newId);
    });
  });

  // 4) Login as admin (HR)
  it("should login as admin (HR)", () => {
    cy.request("POST", `${apiUrl}/auth/login`, {
      email:    "admin@example.com",  // must match your deployed admin’s email
      password: "admin",
    }).then((response) => {
      logIfBadStatus(response, 200);
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("token");

      Cypress.env("adminAuthToken", response.body.token);
    });
  });

  // 5) View all resignations as admin (HR)
  it("should view all resignations submitted by employees as admin", () => {
    const token = Cypress.env("adminAuthToken");
    cy.request({
      method: "GET",
      url:    `${apiUrl}/admin/resignations`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      logIfBadStatus(response, 200);
      expect(response.status).to.eq(200);
      expect(response.body.data).to.be.an("array");

      // Confirm that our newly‐created resignationId appears in the list
      const found = response.body.data.some((r) => r._id === employeeResignationId);
      expect(found).to.be.true;
    });
  });

  // 6) Approve that resignation as admin (HR)
  it("should approve the employee’s resignation as admin", () => {
    const token = Cypress.env("adminAuthToken");
    cy.request({
      method: "PUT",
      url:    `${apiUrl}/admin/conclude_resignation`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: {
        resignationId:          employeeResignationId,
        approved:               true,
        intendedLastWorkingDay: "2026-03-11T00:00:00.000Z",
        exitDate:               "2028-10-11T00:00:00.000Z",
      },
      failOnStatusCode: false,
    }).then((response) => {
      logIfBadStatus(response, 200);
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.property("status", "Approved");

      // Re‐store it in case anything overwrote it (not strictly required,
      // but harmless):
      Cypress.env("employeeResignationId", response.body.data._id);
    });
  });

  // 7) Employee completes the exit‐interview
  it("should allow the employee to submit responses to exit questionnaire", () => {
    const token        = Cypress.env("employeeAuthToken");
    const resignationId = Cypress.env("employeeResignationId");
    // └── if this is still undefined, Cypress will immediately error out.

    // Debug: print it to the Cypress console so you can confirm it's set
    console.log("▶ About to POST exit responses for resignationId =", resignationId);

    cy.request({
      method: "POST",
      url:    `${apiUrl}/user/responses`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: {
        resignationId,
        responses: [
          {
            questionText: "What prompted you to start looking for another job?",
            response:     "Lack of career growth opportunities",
          },
          {
            questionText: "Would you recommend this company to others?",
            response:     "Yes, with some reservations",
          },
        ],
      },
      failOnStatusCode: false,
    }).then((response) => {
      // The controller returns 201 on success
      logIfBadStatus(response, 201);
      expect(response.status).to.eq(201);

      expect(response.body).to.have.property("message", "Exit interview submitted");
      const { data } = response.body;

      // Make sure the returned document has at least these fields:
      expect(data).to.have.property("resignation", resignationId);
      expect(data).to.have.property("employee");
      expect(data).to.have.property("responses");
      expect(data.responses).to.be.an("array").and.have.length(2);
    });
  });

  // 8) Admin views all exit‐interview responses
  it("should allow the admin to view all questionnaire responses", () => {
    const token        = Cypress.env("adminAuthToken");
    const resignationId = Cypress.env("employeeResignationId");
    console.log("▶ About to GET exit_responses; looking for resignationId =", resignationId);

    cy.request({
      method: "GET",
      url:    `${apiUrl}/admin/exit_responses`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      logIfBadStatus(response, 200);
      expect(response.status).to.eq(200);
      expect(response.body.data).to.be.an("array");

      // Find the entry whose `.resignation` matches our ID:
      const found = response.body.data.find((item) => item.resignation === resignationId);
      expect(
        found,
        `Responses for resignationId ${resignationId} not found`
      ).to.exist;
    });
  });
});

