// cypress/integration/backend/backendTests.spec.js

describe("Backend API Tests for Employee and Admin Role", () => {
  const apiUrl = "https://exit-kxgu.onrender.com/api";
  let employeeResignationId = null;

  // Generate a unique alphanumeric username, an email, and a ≥6‐char password:
  const timestamp = Date.now();
  const employeeUsername = `emp${timestamp}`;            // only letters/numbers
  const employeeEmail = `emp${timestamp}@example.com`;
  const employeePassword = "emp1234";                     // length ≥ 6

  /**
   * If `response.status !== expectedStatus`, dump the entire `response` to the console
   * and also print the JSON‐stringified body into Cypress's GUI log.
   */
  function logIfBadStatus(response, expectedStatus) {
    if (response.status !== expectedStatus) {
      // Dump the entire response object in DevTools console (⇒ “Console” tab in Cypress runner)
      // NOTE: In a headed run, press F12 / DevTools to inspect it.
      // console.dir(response) shows all keys (status, body, headers, redirectedToUrl, etc.)
      // tslint:disable-next-line:no-console
      console.dir(response);

      // Also write a short summary into Cypress's GUI under “.log()” messages:
      cy.log(`⬇️ [${response.status}] ${response.redirectedToUrl || response.url || "URL unknown"}`);
      cy.log("Headers: " + JSON.stringify(response.headers, null, 2));
      cy.log("Body:");
      cy.log(JSON.stringify(response.body, null, 2));
    }
  }

  // 1) Register a new employee
  it("should register a new employee", () => {
    cy.request({
      method: "POST",
      url: `${apiUrl}/auth/register`,
      body: {
        username: employeeUsername,
        email:    employeeEmail,
        password: employeePassword,
      },
      failOnStatusCode: false,
    }).then((response) => {
      logIfBadStatus(response, 201);
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property("message", "User registered successfully");
    });
  });

  // 2) Login the employee with valid credentials (email + password)
  it("should login the employee with valid credentials", () => {
    cy.request({
      method: "POST",
      url: `${apiUrl}/auth/login`,
      body: {
        email:    employeeEmail,
        password: employeePassword,
      },
      failOnStatusCode: false,
    }).then((response) => {
      logIfBadStatus(response, 200);
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("token");
      Cypress.env("employeeAuthToken", response.body.token);
    });
  });

  // 3) Submit resignation for an employee
  // cypress/integration/backend/backendTests.spec.js

it("should submit resignation for an employee", () => {
  const token = Cypress.env("employeeAuthToken");
  cy.request({
    method: "POST",
    url:   `${apiUrl}/user/resign`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      intendedLastWorkingDay: "2026-03-11T00:00:00.000Z",
      reason:                 "nahi jana hai"
    },
    failOnStatusCode: false,
  }).then((response) => {
    
    logIfBadStatus(response, 201);
    expect(response.status).to.eq(201);

    // Now the data._id is at response.body.data._id
    expect(response.body).to.have.nested.property("data._id");

    // Check that the returned data fields match what you sent:
    expect(response.body.data).to.include({
      intendedLastWorkingDay: "2026-03-11T00:00:00.000Z",
      reason:                 "nahi jana hai",
      status:                 "Pending",
      exitDate:               null,
      decidedAt:              null,
    });

    // Store for the next tests
    employeeResignationId = response.body.data._id;
  });
});



  // 4) Login as admin (HR) using email + password
  it("should login as admin (HR)", () => {
    cy.request({
      method: "POST",
      url: `${apiUrl}/auth/login`,
      body: {
        email:    "admin@example.com",
        password: "admin",
      },
      failOnStatusCode: false,
    }).then((response) => {
      logIfBadStatus(response, 200);
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("token");
      Cypress.env("adminAuthToken", response.body.token);
    });
  });

  // 5) View all resignations submitted by employees as admin
  it("should view all resignations submitted by employees as admin", () => {
    const token = Cypress.env("adminAuthToken");
    cy.request({
      method: "GET",
      url: `${apiUrl}/admin/resignations`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      logIfBadStatus(response, 200);
      expect(response.status).to.eq(200);
      expect(response.body.data).to.be.an("array");

      const found = response.body.data.some(
        (r) => r._id === employeeResignationId
      );
      expect(found).to.be.true;
    });
  });

  // 6) Approve the employee’s resignation as admin
  it("should approve the employee’s resignation as admin", () => {
  const token = Cypress.env("adminAuthToken");

  cy.request({
    method: "PUT",
    url:   `${apiUrl}/admin/conclude_resignation`,
    headers: {
      Authorization: `Bearer ${token}`,
      // Cypress will set “Content-Type” for you, so you can omit it here
    },
    body: {
      resignationId:          employeeResignationId,
      approved:               true,
      // Use exactly the same date‐string format you verified in Postman:
      intendedLastWorkingDay: "2026-03-11",
      exitDate:               "2028-10-11"
    },
    failOnStatusCode: false,
  }).then((response) => {
    // dump the entire response to console first, so you can see any validation errors:
    console.log("PUT /applicate→admin/conclude_resignation RESP:", response);

    // Now assert that server returns 200 OK
    logIfBadStatus(response, 200);
    expect(response.status).to.eq(200);

    // Finally check that “status” has been updated to “Approved”:
    expect(response.body.data).to.have.property("status", "Approved");
  });
});


  // 7) Employee completes the exit‐interview
  it("should allow the employee to submit responses to exit questionnaire", () => {
    const token = Cypress.env("employeeAuthToken");
    cy.request({
      method: "POST",
      url: `${apiUrl}/user/responses`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: {
        resignationId: employeeResignationId,
        responses: [
          {
            questionText:
              "What prompted you to start looking for another job?",
            response: "Lack of career growth opportunities",
          },
          {
            questionText: "Would you recommend this company to others?",
            response: "Yes, with some reservations",
          },
        ],
      },
      failOnStatusCode: false,
    }).then((response) => {
      logIfBadStatus(response, 200);
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.property(
        "resignationId",
        employeeResignationId
      );
    });
  });

  // 8) Admin views all exit‐interview responses (SKIPPED)
  it("should allow the admin to view all questionnaire responses", () => {
    const token = Cypress.env("adminAuthToken");
    cy.request({
      method: "GET",
      url: `${apiUrl}/admin/exit_responses`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      logIfBadStatus(response, 200);
      expect(response.status).to.eq(200);
      expect(response.body.data).to.be.an("array");

      const expected = [
        {
          questionText: "What prompted you to start looking for another job?",
          response: "Lack of career growth opportunities",
        },
        {
          questionText: "Would you recommend this company to others?",
          response: "Yes, with some reservations",
        },
      ];

      const found = response.body.data.some((item) => {
        if (item.resignationId !== employeeResignationId) return false;
        return (
          Array.isArray(item.responses) &&
          item.responses.length === expected.length &&
          item.responses.every((resp, i) => {
            return (
              resp.questionText === expected[i].questionText &&
              resp.response === expected[i].response
            );
          })
        );
      });
      expect(found).to.be.true;
    });
  });
});
