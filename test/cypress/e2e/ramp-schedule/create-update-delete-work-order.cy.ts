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


    it('Testing to create a "Work Order" in Schedule', () => {
        cy.get('.tw-inline-flex > button').first().click();
        cy.createWorkOrderInSchedule();
    });

    it('Testing updating a "Work Order" in Schedule', () => {
        cy.get('#kanban-card-actions').first().should('be.visible');
        cy.contains('TEST-00/TEST-00').first().click();

        cy.get('form').find('.q-expansion-item.q-expansion-item--standard').then($item => {
            if ($item.first().hasClass('q-expansion-item--collapsed')) {
                cy.wrap($item.first()).find('.q-expansion-item__container').click();
            }
            if ($item.eq(1).hasClass('q-expansion-item--collapsed')) {
                cy.wrap($item.eq(1)).find('.q-expansion-item__container').click();
            }
        });

        cy.get('[data-testid="dynamicField-inboundFlightNumber"]', { timeout: 60000 })
            .find('input')
            .clear()
            .type('TEST-01');

        cy.get('[data-testid="dynamicField-outboundFlightNumber"]', { timeout: 60000 })
            .clear()
            .type('TEST-01');

        cy.get('[aria-label="*Operation"]').click();
        cy.contains('[role="option"]', 'Half_turn_Inbound', { timeout: 10000 })
            .click({ timeout: 10000 });

        cy.get('input[aria-label="Flight Status"]').click();
        cy.contains('[role="option"]', 'Scheduled').click({ timeout: 10000 });
        cy.get('input[aria-label="Aircraft types"]').click();
        cy.get('[role="option"]').first().click({ timeout: 10000 });

        cy.get('.tw-border > .tw-space-x-2').find('button').eq(0).click();
        cy.contains('TEST-01').should('be.visible', { timeout: 15000 });
    })

    it('Testing to delete a "Work Order" in Schedule', () => {
        cy.deleteWorkOrderInSchedule();
    })
})