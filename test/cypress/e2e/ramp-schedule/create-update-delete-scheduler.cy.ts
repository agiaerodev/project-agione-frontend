import moment from 'moment';

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false previene que Cypress falle el test
  return false;
});

describe('Ramp Schedule', () => {
    beforeEach(() => {
        cy.visit('/ramp/schedule/index');
        cy.login();
    });

    it('Testing create a Scheduler', () => {
        cy.createScheduler(0);
    })

    it('Testing updating a scheduler', () => {
        cy.updatingScheduler();
    })

    it('Testing the removal of a Scheduler', () => {
        cy.removalScheduler();
    })
})