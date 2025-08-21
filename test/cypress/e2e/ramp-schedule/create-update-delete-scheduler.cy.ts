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

    it('Testing the station selection modal in the "schedule"', () => {
        cy.get('body').then(($body) => {
            const hasModal = $body.find('#masterModalContent').length > 0;
            const hasFilterText = $body.text().includes('Filter schedule');
            const hasSelectText = $body.text().includes('You must first select a');
            const hasStationInput = $body.find('input[aria-label="Station"]').length > 0;

            if (hasModal && hasFilterText && hasSelectText && hasStationInput) {
                cy.selectStation();
                cy.get('#masterModalContent').should('not.exist');
                cy.contains('Filter schedule').should('not.exist');
            }
        });
    })

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