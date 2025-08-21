import moment from 'moment';

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false previene que Cypress falle el test
  return false;
});

describe('Ramp Work Order', () => {
    beforeEach(() => {
        cy.visit('/ramp/work-orders/index');
        cy.wait(10000);
        cy.get('body').then(($body) => {
            if ($body.find('.q-form > :nth-child(1)').length > 0) {
                cy.get('.q-form > :nth-child(1)').type('soporte@imaginacolombia.com')
                cy.get('.q-form > :nth-child(2)').type('ZAQxsw123@');          
                cy.get('.q-btn').click();
            }
        });
    });

    const runFlightSectionIntegrityTest = () => {
        cy.get('input[aria-label="*Customer"]').should('be.visible');
        cy.get('input[aria-label="*Station"]').should('be.visible');
        cy.get('input[aria-label="*A/C Type"]').should('be.visible');
        cy.get('input[aria-label="*Operation"]').should('be.visible');
        cy.get('input[aria-label="*Carrier"]').should('be.visible');
        cy.get('input[aria-label="*Parking Spot"]').should('be.visible');
        cy.get('input[aria-label="*Status"]').should('be.visible');
        cy.get('input[aria-label="Assigned to"]').should('be.visible');
    }

    const runServicesSectionIntegrityTest = () => {
        cy.get('#stepComponent').contains('Services').click();
        cy.get('section').contains('Services', { timeout: 60000 }).should('be.visible');
        cy.get('input[placeholder="What are you looking for?"]').should('be.visible');

        cy.get('ul, ol').contains('Services').should('be.visible'); // Ajusta si no es ul/ol
        cy.contains('Equipment').should('be.visible');
        cy.contains('Crew').should('be.visible');
        cy.get('#stepComponent').contains('Cargo').scrollIntoView().should('be.visible');

        cy.get('ul, ol').contains('Services').click(); // Ajusta si no es ul/ol
        cy.get('.fa-star').first().should('be.visible');

        cy.get('.tw-flex > div:nth-child(3) > .q-btn').first().should('be.visible');
        cy.get('.tw-flex > div > .q-btn').first().should('be.visible');
    }

    const runRemarkSectionIntegrityTest = () => {
        cy.get('#stepComponent').contains('Remark').click();

        cy.get('textarea[aria-label="Remark"]').first().should('be.visible');
        cy.get('textarea[aria-label="Safety Message"]').should('be.visible');
    }

    const runSignatureSectionIntegrityTest = () => {
        cy.get('#stepComponent').contains('Signature').click();

        cy.contains('Customer Representative').should('be.visible');
        cy.contains('AGI Representative Signature').should('be.visible');
        cy.get('[data-testid="dynamicField-customerName"]')
            .find('input[aria-label="Print Name"]').should('be.visible');
        cy.get('[data-testid="dynamicField-customerTitle"]')
            .find('input[aria-label="Title"]').should('be.visible');
        cy.get('[data-testid="dynamicField-representativeName"]')
            .find('input[aria-label="Print Name"]').should('be.visible');
        cy.get('[data-testid="dynamicField-representativeTitle"]')
            .find('input[aria-label="Title"]').should('be.visible');
    }

    it('Testing the integrity of the edit modal', () => {
        cy.openFullModal();

        cy.contains('Update Work Order').should('be.visible');
        cy.get('.q-stepper__title', { timeout: 10000 })
            .contains('Flight', { timeout: 10000 })
            .should('be.visible');
        cy.get('.q-stepper__title', { timeout: 10000 })
            .contains('Services', { timeout: 10000 })
            .should('be.visible');
        cy.get('.q-stepper__title', { timeout: 10000 })
            .contains('Remark', { timeout: 10000 })
            .should('be.visible');
        cy.get('.q-stepper__title', { timeout: 10000 })
            .contains('Signature', { timeout: 10000 })
            .should('be.visible');

        cy.get('button').contains('Delete').should('be.visible');
        cy.get('button').contains('Save to Draft').should('be.visible');
        cy.get('button').contains('Close').should('be.visible');

        runFlightSectionIntegrityTest();
        runServicesSectionIntegrityTest();
        runRemarkSectionIntegrityTest();
        runSignatureSectionIntegrityTest();

        cy.get('.master-dialog__actions > div > button:nth-child(4)').should('be.visible');
        cy.get('.master-dialog__header > .q-btn').click();
        cy.get('#formRampComponent').should('not.exist');
    })
})