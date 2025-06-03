Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false previene que Cypress falle el test
  return false;
});

describe('Home', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.wait(10000);
        cy.get('body').then(($body) => {
            if ($body.find('.q-form > :nth-child(1)').length > 0) {
                cy.get('.q-form > :nth-child(1)').type('soporte@imaginacolombia.com')
                cy.get('.q-form > :nth-child(2)').type('ZAQxsw123@');          
                cy.get('.q-btn').click();
            }
        });
    });

    it('Testing the visibility of dashboard filters', () => {
        cy.get('.actions-content #filter-button-crud').click();
        cy.get('input[aria-label="Scheduled date"]').eq(1).should('be.visible');
        cy.get('input[aria-label="Comparison date"]').should('be.visible');
        cy.get('input[aria-label="Customer"], select[aria-label="Customer"]').should('be.visible');
        cy.get('input[aria-label="Contract"], select[aria-label="Contract"]').should('be.visible');
        cy.get('input[aria-label="Status"], select[aria-label="Status"]').should('be.visible');
        cy.get('input[aria-label="Station"], select[aria-label="Station"]').should('be.visible');
        cy.get('input[aria-label="Ad Hoc"], select[aria-label="Ad Hoc"]').should('be.visible');
        cy.get('input[aria-label="Operation Type"], select[aria-label="Operation Type"]').should('be.visible');
        cy.get('input[aria-label="Work Order Types"], select[aria-label="Work Order Types"]').should('be.visible');
    })
})