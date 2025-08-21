Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false previene que Cypress falle el test
  return false;
});


describe('Passenger fueling', () => {
    beforeEach(() => {
        cy.visit('/ramp/fueling/index');
        cy.wait(10000);
        cy.get('body').then(($body) => {
            if ($body.find('.q-form > :nth-child(1)').length > 0) {
                cy.get('.q-form > :nth-child(1)').type('soporte@imaginacolombia.com')
                cy.get('.q-form > :nth-child(2)').type('ZAQxsw123@');          
                cy.get('.q-btn').click();
            }
        });
    });

    it('Testing visibility of quickFilter type actions and filters', () => {
        cy.contains('Fueling New', { timeout: 15000 }).should('be.visible');
        cy.get('input[placeholder="Search"]').should('be.visible');
        cy.contains('button', 'New').should('be.visible');
        cy.get('#filter-button-crud').should('be.visible');
        cy.get('#refresh-button-crud').should('be.visible');
        cy.get('input[aria-label="Customer"]').should('be.visible');
        cy.get('input[aria-label="Contract"]').should('be.visible');
        cy.get('input[aria-label="Status"]').should('be.visible');
        cy.get('input[aria-label="Ad Hoc"]').should('be.visible');

        const fields = [
            'ID',
            'Customer',
            'Contracts',
            'Ticket Number',
            'Registration Number',
            'Status',
            'Station',
            'Responsible',
            'Service date',
            'Created At',
            'Updated At',
            'Actions'
        ];

        fields.forEach(field => {
            cy.get('th, td', { timeout: 30000 })
                .contains(field, { timeout: 30000 })
                .should('be.visible');
        });
    })
    
    it('Testing to create a "Work Order" in fueling', () => {
        cy.contains('button', 'New').click();
        cy.get('input[aria-label="*Customer/Contract"]').click();
        cy.get('[role="option"]', { timeout: 80000 }).first().click();

        cy.get('input[aria-label="*Fueling ticket number"]').type('TEST-00');

        cy.get('input[aria-label="Responsible"]').type('ima');
        cy.get('[role="option"]', { timeout: 120000 })
            .contains('Imagina Colombia', { timeout: 10000 })
            .click();
        

        cy.get('input[aria-label="*Station"]').click();
        cy.get('[role="option"]', { timeout: 120000 }).first().click();

        cy.get('button').contains('Save').click();

        cy.contains('Update fueling', { timeout: 15000 }).should('be.visible');
    })

    it('Testing updating a "Work Order" in fueling', () => {
        cy.get('tbody .q-tr.tw-bg-white').first().find('button').eq(1).click();
        cy.contains('a', 'Edit').click();

        cy.contains('Update fueling Id:', { timeout: 50000 }).should('be.visible');

        cy.get('input[aria-label="*Customer/Contract"]').click({ force: true });
        cy.get('[role="option"]', { timeout: 10000 }).first().click();

        cy.get('#masterModalContent').contains('Update fueling Id:').click();

        cy.get('input[aria-label="*A/C Type"]').click();
        cy.get('[role="option"]', { timeout: 10000 }).first().click();

        cy.get('input[aria-label="*Carrier"]').click();
        cy.wait(1000)
        cy.get('[role="option"]', { timeout: 10000 })
            .eq(2)
            .click({ timeout: 10000, force: true });

        cy.contains('Update fueling Id:').click();

        cy.get('input[aria-label="Aircraft Registration"]').type('545218');

        cy.get('#stepComponent').contains('Services').click();
        cy.get('ul').contains('Services').click();
        cy.get('.tw-flex > div:nth-child(3) > .q-btn').first().click();
        cy.get('div:nth-child(2) > div > div > #dynamicFieldComponent > div > .tw-flex > div:nth-child(3) > .q-btn')
            .first()
            .click();

        cy.get('#stepComponent').contains('Remark').click();

        cy.get('textarea[aria-label="Remark"]').type('Remark test');
        cy.get('textarea[aria-label="Safety Message"]').type('Safety Message test');

        cy.get('button').contains('Close Flight').click();
        cy.contains('Record updated', { timeout: 30000 }).should('be.visible');
    })

    it('Testing to delete a "Work Order" in fueling', () => {
        cy.get('tbody .q-tr.tw-bg-white', { timeout: 60000 }).first().as('row');
        cy.get('@row').should('be.visible');

        // Get the text of the cell (id)
        cy.get('@row').find('td').eq(2).invoke('text').then((id) => {
            // Click on the second button in the row
            cy.get('@row').find('button').eq(1).click();

            // Click on the "Delete" link
            cy.get('a').contains('Is a wrong flight').click();

            cy.get('button').contains('Cancel').should('be.visible');
            cy.contains('Are you sure you want to delete this work order').should('be.visible');
            cy.get('button').contains('Yes').should('be.visible');
            cy.get('button').contains('Yes').click();

            cy.contains('Record NOT deleted').should('not.exist');
            cy.get('table', { timeout: 60000 }).should('not.contain', id.trim());
        });
    })
})