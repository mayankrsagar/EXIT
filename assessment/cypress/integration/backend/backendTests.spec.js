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