Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false previene que Cypress falle el test
  return false;
});

describe('Passenger Schedule', () => {

    beforeEach(() => {
        cy.visit('/passenger/schedule/index');
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

    it('Testing the schedule filters', () => {
        cy.scheduleFilters();
    })

    it('Testing the sheduler view actions', () => {
        cy.get('button').contains('Scheduler').click({ timeout: 80000 });
        cy.get('#titleCrudTable').should('be.visible');
        cy.get('button').contains('Back to schedule').should('be.visible');
        cy.get('button').contains('New').should('be.visible');
        cy.get('#crudIndexViewAction').should('be.visible');
        cy.get('#filter-button-crud').should('be.visible');
        cy.get('#refresh-button-crud').should('be.visible');
        cy.get('input[aria-label="Customer"]').should('be.visible');
        cy.get('button').contains('Filters:').should('be.visible');
    })

    it('Testing create a Scheduler', () => {
        cy.createScheduler(2);
    })

    it('Testing updating a scheduler', () => {
        cy.updatingScheduler();
    })

    it('Testing the removal of a Scheduler', () => {
        cy.removalScheduler();
    })
})