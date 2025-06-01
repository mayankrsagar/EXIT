describe("Backend API Tests for Employee and Admin Role", () => {
  const apiUrl = "https://exit-kxgu.onrender.com/api";
  // const apiUrl="http://localhost:5000/api";
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
      expect(response.body).to.have.property('message', 'User registered successfully');
    });
  });

  //   cy.request({
  //     method: 'POST',
  //     url: `${baseUrl}/api/auth/login`,
  //     body: {
  //       username: employeeUsername,
  //       password: 'password123'
  //     }
  //   }).then((response) => {
  //     expect(response.status).to.eq(200);
  //     expect(response.body).to.have.property('token');
  //     employeeToken = response.body.token;
  //   });
  // });

  // it('should submit resignation for an employee', () => {
  //   cy.request({
  //     method: 'POST',
  //     url: `${baseUrl}/api/user/resign`,
  //     headers: {
  //       Authorization: employeeToken
  //     },
  //     body: {
  //       intendedLastWorkingDay: "2024-12-26"
  //     }
  //   }).then((response) => {
  //     expect(response.status).to.eq(200);
  //     expect(response.body.data).to.have.property('resignation');
  //     expect(response.body.data.resignation).to.have.property('_id');
  //     resignationId = response.body.data.resignation._id;
  //   });
  // });

  // it('should login as admin (HR)', () => {
  //   cy.request({
  //     method: 'POST',
  //     url: `${baseUrl}/api/auth/login`,
  //     body: {
  //       username: 'admin',
  //       password: 'admin'
  //     }
  //   }).then((response) => {
  //     expect(response.status).to.eq(200);
  //     expect(response.body).to.have.property('token');
  //     adminToken = response.body.token;
  //   });
  // });

  // it('should view all resignations submitted by employees as admin', () => {
  //   cy.request({
  //     method: 'GET',
  //     url: `${baseUrl}/api/admin/resignations`,
  //     headers: {
  //       Authorization: adminToken
  //     }
  //   }).then((response) => {
  //     expect(response.status).to.eq(200);
  //     expect(response.body.data).to.be.an('array');
      
  //     // Verify our test resignation is in the list
  //     const testResignation = response.body.data.find(
  //       r => r._id === resignationId
  //     );
  //     expect(testResignation).to.exist;
  //   });
  // });

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
      const found = response.body.data.find((item) => {
   return (
    item.resignation &&
     typeof item.resignation === 'object' &&
     item.resignation._id === resignationId
   );
 });
 expect(
   found,
  `Responses for resignationId ${resignationId} not found`
 ).to.exist;
    });
  });
});
  