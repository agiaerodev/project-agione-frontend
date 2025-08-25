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

    it('Check the display of actions and filter fields', () => {
        cy.get('#innerLoadingMaster', { timeout: 120000 }).should('not.exist');
        cy.get('[data-testid="btn-dropdown-New-1"]', { timeout: 20000 }).should('be.visible');
        cy.get('div:nth-child(4) > .q-btn').should('be.visible');
        cy.get('div:nth-child(5) > .q-btn').should('be.visible');
        cy.get('#filter-button-crud').should('be.visible');
        cy.get('#refresh-button-crud').should('be.visible');
        cy.get('input[aria-label="Customer"]').should('be.visible');
        cy.get('input[aria-label="Contract"]').should('be.visible');
        cy.get('input[aria-label="Status"]').should('be.visible');
        cy.get('#crudIndexViewAction').should('be.visible');
        cy.get('input[placeholder="Search"]', { timeout: 10000 }).should('be.visible');
    })

    it('Verify section titles', () => {
        cy.openFullModal()
        cy.get('.q-stepper__title', { timeout: 10000 })
            .contains('Flight', { timeout: 10000 })
            .should('be.visible');
        cy.get('.q-stepper__title').contains('Services').should('be.visible');
        cy.get('.q-stepper__title').contains('Delay').should('be.visible');
        cy.get('.q-stepper__title').contains('Remark').should('be.visible');
    })

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
});