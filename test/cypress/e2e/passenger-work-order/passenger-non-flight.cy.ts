Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false previene que Cypress falle el test
  return false;
});

import moment from 'moment';

const FORMAT_DATE = 'MM/DD/YYYY HH:mm';
const today = moment().format(FORMAT_DATE);
const tomorrow = moment().add(1, 'day').format(FORMAT_DATE);
const yesterday = moment().subtract(1, 'day').format(FORMAT_DATE);

describe('Passenger Work Order', () => {
    beforeEach(() => {
        cy.visit('/passenger/work-orders/index');
        cy.login();
    });

    it('Testing AI', () => {
        cy.get('.tw-ml-1 > div > .q-btn > .q-btn__content')
            .click({ timeout: 10000 });

        cy.get('div[role="menu"]', { timeout: 10000 })
            .should('be.visible');

        cy.get('div[role="menu"] > section > div')
            .eq(1)
            .contains('Do you need help?')
            .should('be.visible');
        
        cy.get('div[role="menu"] > section')
            .eq(1)
            .find('button')
            .first()
            .should('be.visible');

        cy.get('div[role="menu"] > section')
            .eq(1)
            .find('button')
            .eq(1)
            .should('be.visible');

        cy.get('div[role="menu"] > section')
            .eq(1)
            .find('button')
            .eq(2)
            .should('be.visible');

        cy.get('div[role="menu"] > section')
            .first()
            .find('div')
            .first()
            .find('textarea')
            .type('Give me all for United Airlines in YVR for May');

        cy.get('div[role="menu"] > section')
            .eq(1)
            .find('button')
            .eq(1)
            .click();

        cy.get('div[role="menu"] > section')
            .first()
            .find('div')
            .eq(1)
            .find('button')
            .should('be.visible');
    })

    it('Testing creating a non-flight from "Additional Flight Services"', () => {
        cy.get('[data-testid="btn-dropdown-New-1"]').click();
        cy.contains('Create Non Flight').should('be.visible');
        cy.contains('Create Non Flight').click();
        cy.contains('Create non-flight').should('be.visible');

        cy.get('button').contains('Additional Flight Services').should('be.visible');
        cy.get('button').contains('Non Flight Services').should('be.visible');

        cy.get('input[aria-label="*Flight number"]').should('be.visible');
        cy.contains('Enter the fight number and press enter or press the search icon').should('be.visible');
        cy.get('input[aria-label="*Flight number"]').type('nk1278').type('{enter}');

        // Wait for the results table to be visible
        cy.get('#flight-results-table', { timeout: 20000 }).should('be.visible');

        cy.get('#flight-results-table')
            .contains('Inbound Flight Number')
            .should('be.visible');
        cy.get('#flight-results-table')
            .contains('Inbound Scheduled Arrival')
            .should('be.visible');
        cy.get('#flight-results-table')
            .contains('Outbound Flight Number')
            .should('be.visible');
        cy.get('#flight-results-table')
            .contains('Outbound Scheduled Departure')
            .should('be.visible');
        cy.get('#flight-results-table')
            .contains('Service Date Created')
            .should('be.visible');

        cy.get('input[aria-label="Search..."]').should('be.visible');
        cy.get('button').contains('cancel').should('be.visible');
    })

    it('Testing creating a non-flight from "Non Flight Services"', () => {
        // Cypress test translation from Playwright
        cy.get('[data-testid="btn-dropdown-New-1"]').click();
        cy.contains('Create Non Flight').click();
        cy.get('button').contains('Non Flight Services').click();

        cy.contains('*Customer/Contract').should('be.visible');
        cy.get('.absolute-right > .q-btn').should('be.visible');
        cy.get('input[aria-label="Flight Number"').should('be.visible');
        cy.get('input[aria-label="*Station"]').should('be.visible');
        cy.get('input[aria-label="*Date Entered"]').should('be.visible');
        cy.get('input[aria-label="Assigned to"]').should('be.visible');
        cy.contains('If you left this field empty').should('be.visible');
        cy.get('button').contains('Save').should('be.visible');

        cy.get('input[aria-label="*Customer/Contract"]').click();
        cy.get('[role="option"]').first().click();

        cy.get('input[aria-label="Flight Number"').type('TEST-01');

        cy.get('input[aria-label="Assigned to"]').type('ima');
        cy.get('[role="option"]', { timeout: 10000 }).contains('Imagina Colombia').click();

        cy.get('button').contains('Save').click();

        cy.contains('Update Work Order Id:', { timeout: 6000 }).should('be.visible');
        cy.contains('Non-flight').should('be.visible');
    })

    it('Testing that the correct form is displayed in the "flight" section of the edit modal for a "non-flight" type Work Order', () => {
        cy.openFullModal()

        cy.get('[role="combobox"][aria-label="*Customer"]').should('be.visible');
        cy.get('input[aria-label="*Station"]').should('be.visible');
        cy.get('input[aria-label="*A/C Type"]').should('be.visible');
        cy.get('input[aria-label="*Operation"]').should('be.visible');
        cy.get('[role="combobox"][aria-label="*Carrier"]').should('be.visible');
        cy.get('input[aria-label="*Status"]').should('be.visible');
        cy.get('input[aria-label="*Date Entered"]').should('be.visible');
        cy.get('input[aria-label="Flight Number"]').should('be.visible');
    })

    it('Testing to delete a "Work Order" in "Work Orders"', () => {
        cy.get('tbody').find('.q-tr.tw-bg-white').first().as('row');
        cy.get('@row').should('be.visible');

        cy.get('@row').find('td').eq(2).invoke('text').then((id) => {
            // Click on the second button in the row
            cy.get('@row').find('button').eq(1).click();

            cy.deleteWorkOrder();

            cy.get('table', { timeout: 60000 }).should('not.contain', id.trim());
        });
    })
});