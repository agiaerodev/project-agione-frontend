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

    it('Testing the integrity of the station selection modal', () => {
        cy.get('#masterModalContent', { timeout: 10000 } ).should('be.visible');

        cy.selectStation();

        cy.get('#masterModalContent').should('not.exist');
        cy.contains('Filter schedule').should('not.exist');
    })

    // it('Testing that the modal requesting the station is triggered correctly', () => {
    //     cy.get('button').contains('Scheduler').click();
    //     cy.get('button').contains('Back to schedule').click();
    //     cy.contains('Filter schedule').should('not.exist');

    //     cy.get('[aria-label="Collapse \\"Ramp\\""]').click();
    //     cy.get('[aria-label="Expand \\"Ramp\\""]').click();
    //     cy.get('#menuItem-qrampadminworkOrders').click();
    //     cy.get('#menuItem-qrampadminschedule').click();
    //     cy.contains('Filter schedule').should('not.exist');

    //     cy.get('#menuItem-qrampadminpassengerOperationTypes').click();
    //     cy.get('#menuItem-qrampadminschedule').click();
    //     cy.contains('Filter schedule').should('not.exist');

    //     cy.get('[aria-label="Expand \\"Passenger\\""]').click();
    //     cy.get('#menuItem-qrampadminpassengerSchedule').click();
    //     cy.contains('Filter schedule').should('be.visible');
    //     cy.get('label').contains('Station').click();
    //     cy.get('input').filter(':visible').type('Austin, TX');
    //     cy.get('[role="option"]').contains('Austin, TX (AUS)').click();
    //     cy.get('button').contains('filters').click();

    //     cy.get('[aria-label="Expand \\"Ramp\\""]').click();
    //     cy.get('#menuItem-qrampadminschedule').click();
    //     cy.contains('Filter schedule').should('be.visible');
    // })

    it('Testing the visibility of actions and titles in the "schedule"', () => {
        cy.calendarTitlesAndActions('btn-dropdown--5');
    })

    it('Testing the schedule filters', () => {
        cy.scheduleFilters();
    })

    it('Testing the "Export" actions', () => {
        cy.get('div:nth-child(5) > .q-btn').first().click();
        cy.get('#innerLoadingMaster').should('not.exist');
        cy.contains('New Report').should('be.visible', { timeout: 40000 });
        cy.contains('Export Schedule with current').should('be.visible');
        cy.get('label').contains('Format').should('be.visible');
        cy.contains('Export | Schedule').should('be.visible');
        cy.get('button').contains('Create').should('be.visible');
        // cy.contains('Date:').should('be.visible');
        // cy.contains('Size:').should('be.visible');
        // cy.get('button').contains('Download').should('be.visible');
        cy.get('#masterModalContent').find('button').eq(2).click();

        cy.get('#masterModalContent').should('not.exist');
    })

    it('Testing the "Scheduler" action', () => {
        cy.get('button').contains('Scheduler').click();
        cy.get('#titleCrudTable').should('be.visible');
        cy.get('button').contains('Back to schedule').should('be.visible');
        cy.get('button').contains('New').should('be.visible');
        cy.get('#crudIndexViewAction').should('be.visible');
        cy.get('#filter-button-crud').should('be.visible');
        cy.get('#refresh-button-crud').should('be.visible');
        cy.get('label').contains('Customer').should('be.visible');
        cy.get('button').contains('Filters:').should('be.visible');
    })
})