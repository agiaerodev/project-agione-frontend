import moment from 'moment';

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
        cy.get('#masterModalContent', { timeout: 30000 }).should('be.visible');
        cy.contains('Filter schedule').should('be.visible');
        cy.contains('You must first select a').should('be.visible');
        cy.get('input[aria-label="Station"]').should('be.visible');

        cy.selectStation();

        cy.get('#masterModalContent').should('not.exist');
        cy.contains('Filter schedule').should('not.exist');
    })

    // it('Testing that the modal requesting the station is triggered correctly', () => {
    //     cy.get('button').contains('Scheduler').click({ timeout: 20000, force: true });
    //     cy.get('button').contains('Back to schedule').click();
    //     cy.contains('Filter schedule').should('not.exist');

    //     cy.wait(7000);

    //     cy.visit('/#/passenger/operation-types/index');
    //     cy.visit('/#/passenger/work-orders/index');
        
    //     cy.visit('/#/passenger/schedule/index');
    //     cy.contains('Filter schedule').should('not.exist');
        
    //     cy.visit('/#/passenger/operation-types/index');
    //     cy.visit('/#/passenger/schedule/index');
    //     cy.contains('Filter schedule').should('not.exist');
        
    //     cy.visit('/#/ramp/schedule/index');
    //     cy.contains('label', 'Station').click();
    //     cy.get('[role="option"]', { timeout: 10000 }).contains('Chicago (ORD)').click();
    //     cy.get('button').contains('filters').click();

    //     cy.visit('/#/passenger/schedule/index');
    //     cy.contains('Filter schedule').should('be.visible');
    // })

    it('Testing the visibility of actions and titles in the "schedule"', () => {
        cy.calendarTitlesAndActions('btn-dropdown--4');
    })

    it('Testing changes from day to week and from week to day', () => {
        // checkTheSwitchToTheWeeklyView
        cy.get('button').contains('Week').click();
        cy.get('button').contains('Today').should('be.visible');
        // cy.get('button').contains('Week', { timeout: 10000 }).should('not.exist');
        cy.get('.tw-inline-flex').first().should('be.visible');
        cy.get('.tw-flex-1 > div:nth-child(2) > div > div:nth-child(2) > div')
            .should('be.visible');

        // checkTheSwitchToTheDailyView
        cy.get('button').contains('Today').click();
        cy.get('button').contains('Week').should('be.visible');
        cy.get('button').contains('Today').should('be.visible');
        cy.get('.tw-inline-flex').first().should('be.visible');
        cy.get('.tw-flex-1 > div:nth-child(2) > div > div:nth-child(2) > div')
            .should('not.exist');
    })

    it('Testing to create a "Work Order" in Schedule', () => {
        cy.get('.tw-inline-flex > .q-btn-dropdown').click({ timeout: 10000 });
        cy.get('.q-list > :nth-child(1)').click();
        cy.createWorkOrderInSchedule();
    })

    it('Testing updating a "Work Order" in Schedule', () => {
        cy.contains('TEST-00/TEST-00', { timeout: 10000 }).first().click();

        cy.contains('Update Work Order Id:', { timeout: 10000 }).should('be.visible');

        cy.get('input[aria-label="*Customer"]', { timeout: 10000 }).click();
        cy.get('[role="option"]', { timeout: 40000 }).first().click();

        cy.get('input[aria-label="Cancellation type"]').click();
        cy.get('[role="option"]').first().click();

        cy.get('input[aria-label="*A/C Type"]').click();
        cy.get('[role="option"]').first().click();

        cy.get('input[aria-label="*Cancellation Notice time entered in Hours"]').click().clear().type('51');

        cy.get('form').find('.q-expansion-item.q-expansion-item--standard').then($item => {
            if ($item.first().hasClass('q-expansion-item--collapsed')) {
                cy.wrap($item.first()).find('.q-expansion-item__container').click();
            }
            if ($item.eq(1).hasClass('q-expansion-item--collapsed')) {
                cy.wrap($item.eq(1)).find('.q-expansion-item__container').click();
            }
        });

        cy.get('[data-testid="dynamicField-inboundFlightNumber"]').clear().type('TEST-01');
        cy.get('[data-testid="dynamicField-outboundFlightNumber"]').clear().type('TEST-01');

        cy.get('input[aria-label="Origin"]').click();
        cy.get('[role="option"]').first().click();

        cy.get('[data-testid="dynamicField-inboundTailNumber"]')
            .find('input')
            .clear({ force: true, timeout: 10000 })
            .type('78');

        cy.get('input[aria-label="Inbound Gate Arrival"]').clear().type('18');

        cy.get('input[aria-label="Destination"]').click();
        cy.get('[role="option"]', { timeout: 10000 }).first().click();

        cy.contains('Update Work Order Id:').click();

        cy.get('[data-testid="dynamicField-outboundTailNumber"]')
            .find('input')
            .click()
            .clear()
            .type('78');

        cy.get('input[aria-label="Outbound Gate Departure"]').clear().type('19');

        cy.get('#stepComponent').contains('Services').click();
        cy.contains('Cargo Man Power').click();
        cy.get('.fa-star').first().click();
        cy.get('.tw-flex > div:nth-child(3) > .q-btn').first().click();
        cy.get('div:nth-child(2) > div > div > #dynamicFieldComponent > div > .tw-flex > div:nth-child(3) > .q-btn').first().click();

        cy.get('#stepComponent').contains('Delay').click();
        cy.get('input[aria-label="Our delay"]').click();
        cy.get('[role="option"]').contains('Yes').click();

        cy.get('textarea').clear().type('Delay comment');
        cy.get('input[aria-label="Code"]').click();
        cy.get('[role="option"]').eq(1).click();
        cy.get('input[aria-label="Time"]').clear().type('24');

        cy.get('[role="combobox"][aria-label="Flight type"]').click();
        cy.get('[role="option"]').first().click();

        cy.get('#stepComponent').contains('Remark').click();
        cy.get('textarea[aria-label="Remark"]').clear().type('Message');
        cy.get('textarea[aria-label="Safety Message"]').clear().type('Message');

        cy.get('button').contains('Close').click();
        cy.contains('Record updated', { timeout: 20000 }).should('be.visible');
        cy.get('#innerLoadingMaster div', { timeout: 10000 }).should('not.exist');

        cy.get('[data-testid="kanbanDay"]')
            .find('div')
            .contains('TEST-01/TEST-01')
            .first({ timeout: 30000 })
            .should('be.visible');
    })

    it('Testing to delete a "Work Order" in Schedule', () => {
        cy.deleteWorkOrderInSchedule();
    })

    it('Testing the schedule filters', () => {
        cy.scheduleFilters();
    })

    it('Testing the sheduler view actions', () => {
        cy.get('button').contains('Scheduler').click();
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