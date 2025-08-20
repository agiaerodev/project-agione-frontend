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
        cy.get('#innerLoadingMaster').should('not.exist');
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

    it('Testing feature delays', () => {
        const dateBlockIn = moment().add(15, 'minutes').format(FORMAT_DATE);
        let dateBlockOut = moment().add(1, 'day').add(30, 'minutes').format(FORMAT_DATE);
        
        cy.get(':nth-child(1) > .text-right > .crudIndexActionsColumn > .q-btn').click();
        cy.get('a').contains('Edit').click();

        cy.contains('Update Work Order', { timeout: 10000 }).should('be.visible');

        cy.get('[data-testid="dynamicField-outboundBlockOut"]')
            .find('input')
            .clear({ force: true })
            .type(dateBlockOut);

        // Expand the first expansion item if not expanded
        cy.get('form').find('.q-expansion-item.q-expansion-item--standard').then($item => {
            if ($item.first().hasClass('q-expansion-item--collapsed')) {
                cy.wrap($item.first()).find('.q-expansion-item__container').click();
            }
            if ($item.eq(1).hasClass('q-expansion-item--collapsed')) {
                cy.wrap($item.eq(1)).find('.q-expansion-item__container').click();
            }
        });

        cy.get('[data-testid="dynamicField-outboundScheduledDeparture"]')
            .find('input')
            .click()
            .clear()
            .type(tomorrow);

        cy.get('[data-testid="dynamicField-outboundBlockOut"]')
            .find('input')
            .click()
            .clear()
            .type(dateBlockOut);

        cy.get('[data-testid="dynamicField-outboundScheduledDeparture"]')
            .find('input')
            .click()
            .clear()
            .type(tomorrow);

        cy.get('button').contains('Close').click();

        cy.contains('You have to enter the at least one delay reason for the', { timeout: 15000 })
            .should('be.visible');

        cy.get('[data-testid="dynamicField-inboundBlockIn"]')
            .find('input')
            .click()
            .clear()
            .type(dateBlockIn);

        cy.get('[data-testid="dynamicField-inboundScheduledArrival"]')
            .find('input')
            .click()
            .clear()
            .type(today);


        cy.get('[role="combobox"][aria-label="*Our delay"]').first().click();
        cy.get('[role="option"]').first().click();

        cy.contains('You have to enter the at least one delay reason for the', { timeout: 15000 })
            .should('not.exist');

        cy.get('button').contains('Close').click();

        // cy.contains('There are missing fields to complete, check the form', { timeout: 10000 })
        //     .should('be.visible');

        cy.get('[role="combobox"][aria-label="*Our delay"]')
            .eq(1)
            .click();
        cy.get('[role="option"]')
            .eq(1)
            .click();

        cy.get('button').contains('Close').click();

        cy.contains('You have to enter the at least one delay reason for the', { timeout: 15000 })
            .should('be.visible');

        // The alert is expected to be hidden because it interferes 
        // with the display of options in the code field.
        cy.contains('You have to enter the at least one delay reason for the', { timeout: 10000 })
            .should('not.exist');

        cy.get('[role="combobox"][aria-label="*Code"]').first().click();
        cy.get('[role="option"]').first().click();

        cy.get('[role="combobox"][aria-label="*Code"]').eq(1).click();
        cy.get('[role="option"]').eq(4).click();

        cy.get('button').contains('Close').click();

        cy.contains('There are missing fields to complete, check the form', { timeout: 10000 })
            .should('not.exist');

        cy.contains('You have to enter the at least one delay reason for the', { timeout: 15000 })
            .should('not.exist');

        cy.get('#formRampComponent', { timeout: 10000 }).should('not.exist');
        cy.contains('Record updated').should('be.visible');

        cy.get(':nth-child(1) > .text-right > .crudIndexActionsColumn > .q-btn').click();
        cy.get('a').contains('Edit').click();

        cy.get('[role="combobox"][aria-label="*Operation"]').should('be.visible').click();
        cy.get('[role="option"]').contains(/^TURN$/).click();

        cy.get('[role="combobox"][aria-label="*Code"]').should('have.length', 1);

        dateBlockOut = moment().add(1, 'day').add(25, 'minutes').format(FORMAT_DATE);

        cy.get('[data-testid="dynamicField-outboundBlockOut"]')
            .find('input')
            .click()
            .clear()
            .type(dateBlockOut);
        
        // Expand the first expansion item if not expanded
        cy.get('form').find('.q-expansion-item.q-expansion-item--standard').then($item => {
            if ($item.first().hasClass('q-expansion-item--collapsed')) {
                cy.wrap($item.first()).find('.q-expansion-item__container').click();
            }
            if ($item.eq(1).hasClass('q-expansion-item--collapsed')) {
                cy.wrap($item.eq(1)).find('.q-expansion-item__container').click();
            }
        });

        cy.get('[data-testid="dynamicField-outboundScheduledDeparture"]')
            .find('input')
            .click()
            .clear()
            .type(tomorrow);

        cy.get('[role="combobox"][aria-label="*Code"]', { timeout: 10000 }).should('not.exist');
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