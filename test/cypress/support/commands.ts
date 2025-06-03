// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import moment from 'moment';

Cypress.Commands.add('login', () => {
    cy.wait(9000);
    cy.get('body').then(($body) => {
        if ($body.find('.q-form > :nth-child(1)').length > 0) {
            cy.get('.q-form > :nth-child(1)').type('soporte@imaginacolombia.com')
            cy.get('.q-form > :nth-child(2)').type('ZAQxsw123@');          
            cy.get('.q-btn').click();
        }
    });
})

Cypress.Commands.add("selectStation", () => {
    // Seleccionar la estación
    cy.contains('Filter schedule').should('be.visible');
    cy.contains('You must first select a').should('be.visible');
    cy.get('input[aria-label="Station"]').click();
    cy.get('[role="option"]', { timeout: 10000 }).first().click();
    cy.get('button').contains('filters').should('be.visible');
    cy.get('button').contains('filters').click();
})

Cypress.Commands.add("openFullModal", () => {
    cy.get(':nth-child(1) > .text-right > .crudIndexActionsColumn > .q-btn', { timeout: 40000 })
        .click({ force: true });
    cy.get('a').contains('Edit').click();
})

Cypress.Commands.add("deleteWorkOrder", () => {
    cy.get('a').contains('Delete').click();
    cy.get('button').contains('Cancel').should('be.visible');
    cy.contains('Are you sure, you want to').should('be.visible');
    cy.get('button').contains('Delete').should('be.visible');
    cy.get('button').contains('Delete').click();

    cy.contains('Record NOT deleted').should('not.exist');
})

Cypress.Commands.add("calendarTitlesAndActions", (refreshTestId) => {
    cy.get('input[placeholder="Search"]').should('be.visible');
    cy.get('.actions-content > div > .q-btn').first().should('be.visible');
    cy.get('div:nth-child(3) > .q-btn').first().should('be.visible');
    cy.get('button').contains('Scheduler').should('be.visible');
    cy.get('#filter-button-crud').should('be.visible');

    cy.get(`button[data-testid="${refreshTestId}"]`, { timeout: 15000 })
        .click({ force: true });
    cy.contains('Refresh').should('be.visible');
    cy.contains('Refresh every 1 minutes').should('be.visible');
    cy.contains('Refresh every 5 minutes').should('be.visible');
    cy.contains('Refresh every 10 minutes').should('be.visible');
    cy.contains('Refresh every 15 minutes').should('be.visible');

    cy.get('button').contains('Week').should('be.visible');
    cy.get('button').contains('Today').should('be.visible');
})

Cypress.Commands.add("createWorkOrderInSchedule", () => {
    cy.get('input[aria-label="*Flight number"]').clear().type('TEST-00');

    cy.get('input[aria-label="*Operation"]').click();
    cy.get('[role="option"]').eq(4).click();

    cy.get('input[aria-label="STD"]')
        .clear()
        .type(moment().add(20, 'minute').format('MM/DD/YYYY HH:mm'));

    cy.get('input[aria-label="STA"]')
        .clear()
        .type(moment().format('HH:mm'));

    cy.get('input[aria-label="Flight Status"]').click();
    cy.get('[role="option"]').contains('Departed').click();

    cy.get('input[aria-label="Aircraft types"]').click();
    cy.get('[role="option"]').first().click();

    cy.get('.tw-border > .tw-space-x-2').find('button').eq(0).click();

    cy.contains('TEST-00/TEST-00').last().should('be.visible');
})

Cypress.Commands.add("deleteWorkOrderInSchedule", () => {
    cy.get('[data-testid="kanbanDay"]')
        .find('div')
        .contains('TEST-01', { timeout: 30000 })
        .parents('[data-testid="kanbanDay"]')
        .find('div')
        .find('button')
        .eq(3)
        .click();

    cy.get('#cardContent').contains('TEST-01').should('be.visible');
    cy.contains('Are you sure, you want to').should('be.visible');
    cy.get('button').contains('Cancel').should('be.visible');
    cy.get('button').contains('Delete').should('be.visible');
    cy.get('button').contains('Delete').click();
    cy.contains('Record NOT deleted', { timeout: 10000 }).should('not.exist');
})

Cypress.Commands.add("scheduleFilters", () => {
    cy.get('#filter-button-crud').click();
    cy.get('input[aria-label="Filter by time"]', { timeout: 10000 }).should('be.visible');
    cy.get('input[aria-label="Customer"]').should('be.visible');
    cy.get('input[aria-label="Carrier"]').should('be.visible');
    cy.get('input[aria-label="Station"]').scrollIntoView().should('be.visible');
    cy.get('input[aria-label="Status"]', { timeout: 10000 }).should('be.visible');
    cy.get('input[aria-label="Operation type"]').should('be.visible');
    cy.get('input[aria-label="Flight Status"]').should('be.visible');
    cy.get('input[aria-label="Ad Hoc"]').should('be.visible');
    cy.get('label').contains('Filters').should('be.visible');
    cy.get('button').contains('Search').should('be.visible');

    cy.get('.q-dialog__inner').find('i[role="presentation"]').eq(1).click();
    cy.get('label').contains('Filters').should('not.exist');
})

Cypress.Commands.add("createScheduler", (operation) => {
    cy.get('button').contains('Scheduler').click();
    cy.get('button').contains('New').click();
    cy.contains('New Scheduler').should('be.visible');

    cy.get('input[aria-label="*Customer/Contract"]').click();
    cy.get('[role="option"]', { timeout: 10000 }).first().click();
    cy.get('#masterModalContent div').contains('New Scheduler').first().click();

    cy.get('input[aria-label="Airlines"]').click();
    cy.get('[role="option"]').first().click();
    cy.get('#masterModalContent div').contains('New Scheduler').first().click();

    cy.get('input[aria-label="Station"]').click();
    cy.get('[role="option"]').first().click();
    cy.get('#masterModalContent div').contains('New Scheduler').first().click();

    cy.get('input[aria-label="Aircraft types"]').click();
    cy.get('[role="option"]').first().click();
    cy.get('#masterModalContent div').contains('New Scheduler').first().click();

    cy.get('input[aria-label="*Operation"]').click();
    cy.get('[role="option"]').eq(operation).click();
    cy.get('#masterModalContent div').contains('New Scheduler').first().click();

    cy.get('input[aria-label="* From Date"]').click().clear().type(moment().format('MM/DD/YYYY'));
    cy.get('input[aria-label="* Until Date"]').click().clear().type(moment().add(1, 'day').format('MM/DD/YYYY'));

    cy.get('input[aria-label="Days Of Week"]').click();
    cy.get('[role="option"]', { timeout: 10000 }).contains('Friday').click();

    cy.contains('New Scheduler').first().click();

    cy.get('input[aria-label="*Flight number"]').clear().type('TEST-02');
    cy.get('input[aria-label="* Inbound Schedule Arrival"]').clear().type(moment().format('HH:mm'));
    cy.get('input[aria-label="*Outbound Flight Number"]').click().clear().type('547');
    cy.get('input[aria-label="*Outbound Schedule Departure "]').click().clear().type(moment().add(1, 'hour').format('HH:mm'));
    cy.get('input[aria-label="Dep. +Days"]').click().clear().type('7');

    cy.get('button').contains('Save').click();
    cy.get('#masterModalContent #innerLoadingMaster circle').should('be.visible');
    cy.get('#masterModalContent #innerLoadingMaster circle', { timeout: 10000 }).should('not.exist');
    cy.contains('New Scheduler').should('not.exist');
})

Cypress.Commands.add("updatingScheduler", () => {
    cy.get('button').contains('Scheduler').click();
    
    // Open modal
    cy.get('tbody').find('.q-tr.tw-bg-white').first().find('button').click();
    cy.get('a').contains('Edit').click();

    cy.contains('Update scheduler Id:').should('be.visible');

    cy.get('input[aria-label="Airlines"]').click();
    cy.get('[role="option"]').first().click({ timeout: 10000 });
    cy.contains('Update scheduler Id:').first().click();

    cy.get('input[aria-label="Aircraft types"]').click();
    cy.get('[role="option"]', { timeout: 10000 }).first().click();
    cy.contains('Update scheduler Id:').first().click();

    cy.get('input[aria-label="*Flight number"]').click().clear().type('TEST-03');
    cy.get('input[aria-label="* Inbound Schedule Arrival"]')
        .clear()
        .type(moment().add(20, 'minutes').format('HH:mm'));
    cy.get('input[aria-label="*Outbound Flight Number"]').click().clear().type('850');
    cy.get('input[aria-label="*Outbound Schedule Departure "]')
        .click()
        .clear()
        .type(moment().add(2, 'hour').format('HH:mm'));
    cy.get('input[aria-label="Dep. +Days"]').click().clear().type('8');

    cy.get('button').contains('Save').click();
    cy.get('#masterModalContent #innerLoadingMaster circle').should('be.visible');
    cy.get('#masterModalContent #innerLoadingMaster circle', { timeout: 10000 }).should('not.exist');
    cy.contains('Update scheduler Id:').should('not.exist');
})

Cypress.Commands.add("removalScheduler", () => {
    cy.get('button').contains('Scheduler').click();

    cy.get('tbody').find('.q-tr.tw-bg-white').first().as('firstRow');
    cy.get('@firstRow').should('be.visible');

    cy.get('@firstRow').find('td').eq(0).invoke('text').then((id) => {
        cy.get('@firstRow').find('button').click();

        cy.get('a').contains('Delete').click();
        cy.get('button').contains('Cancel').should('be.visible');
        cy.contains('Are you sure, you want to').should('be.visible');
        cy.get('button').contains('Delete').should('be.visible');
        cy.get('button').contains('Delete').click();

        cy.contains('Record NOT deleted').should('not.exist');
        cy.get('table').contains(id, { timeout: 60000 }).should('not.exist');
    });
})

// DO NOT REMOVE
// Imports Quasar Cypress AE predefined commands
import { registerCommands } from '@quasar/quasar-app-extension-testing-e2e-cypress';
registerCommands();
