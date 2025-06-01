import * as exitInterviewService from '../services/exitInterviewService.js';

it("should allow the employee to submit responses to exit questionnaire", () => {
  const token = Cypress.env("employeeAuthToken");
  const resignationId = Cypress.env("employeeResignationId");

  cy.request({
    method: "POST",
    url: `${apiUrl}/user/responses`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: {
      resignationId,
      responses: [
        {
          questionText: "What prompted you to start looking for another job?",
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
    expect(response.status).to.eq(201);
    expect(response.body).to.have.property("message", "Exit interview submitted");

    // Optional: only test data if it's present
    if (response.body.data) {
      const { data } = response.body;
      expect(data).to.have.property("resignation", resignationId);
      expect(data).to.have.property("employee");
      expect(data.responses).to.be.an("array").and.have.length(2);
    }
  });
});


export const getAllExitInterviews = async (req, res, next) => {
  try {
    // Only HR can view all exit interviews
    if (req.user.role !== 'HR') {
      return res.status(403).json({ error: 'Only HR can view exit interviews' });
    }

    const interviews = await exitInterviewService.getAllExitInterviews();
    return res.status(200).json({ data: interviews });
  } catch (err) {
    next(err);
  }
};
