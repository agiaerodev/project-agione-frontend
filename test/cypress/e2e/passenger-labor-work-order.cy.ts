Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false previene que Cypress falle el test
  return false;
});


describe('Passenger labor work order', () => {
    beforeEach(() => {
        cy.visit('/ramp/labor/index');
        cy.wait(10000);
        cy.get('body').then(($body) => {
            if ($body.find('.q-form > :nth-child(1)').length > 0) {
                cy.get('.q-form > :nth-child(1)').type('soporte@imaginacolombia.com')
                cy.get('.q-form > :nth-child(2)').type('ZAQxsw123@');          
                cy.get('.q-btn').click();
            }
        });
    });

    it('Testing to create a "Work Order" in labor', () => {
        cy.contains('button', 'New').click();
        cy.contains('New Work Order').should('be.visible');
        cy.get('input[aria-label="*Customer"]').should('be.visible');
        cy.get('input[aria-label="*Flight number"]').should('be.visible');
        cy.contains('Enter the fight number and').should('be.visible');
        cy.get('input[aria-label="*Station"]').should('be.visible');
        cy.get('input[aria-label="Assigned to"]').should('be.visible');
        cy.contains('If you left this field empty').should('be.visible');
        cy.contains('button', 'Save').should('be.visible');

        cy.get('input[aria-label="*Customer"]').click();
        cy.get('[role="option"]', { timeout: 40000 }).first().click();
        cy.get('#formRampComponent div').contains('New Work Order').first().click();

        cy.get('input[aria-label="*Flight number"]').clear().type('TEST-00');
        cy.get('input[aria-label="*Station"]').click();
        cy.get('[role="option"]', { timeout: 10000 }).first().click();
        cy.get('input[aria-label="Assigned to"]').type('ima');
        cy.get('[role="option"]', { timeout: 10000 })
            .contains('Imagina Colombia')
            .click();
        cy.contains('button', 'Save').click();

        cy.contains('Error when looking for the').should('not.exist');

        cy.get('.q-toolbar__title').contains('Flight number').should('be.visible');
        cy.contains('Are you sure TEST-00 is a').should('be.visible');
        cy.contains('button', 'Cancel').should('be.visible');
        cy.contains('button', 'Yes').should('be.visible');

        cy.contains('button', 'Yes').click();

        cy.contains('What do you want to do?', { timeout: 180000 }).should('be.visible');
        cy.contains('button', 'Go out to the list').should('be.visible');
        cy.contains('button', 'Continue editing').should('be.visible');
        cy.contains('button', 'Create a new one').should('be.visible');

        cy.contains('button', 'Go out to the list').click();
    })
})