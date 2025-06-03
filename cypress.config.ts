
import { injectQuasarDevServerConfig } from '@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server';
import { defineConfig } from 'cypress';
const fs = require('fs');
const path = require('path');

export default defineConfig({
  fixturesFolder: 'test/cypress/fixtures',
  screenshotsFolder: 'test/cypress/screenshots',
  videosFolder: 'test/cypress/videos',
  video: true,
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        createAuthFolder() {
          const playwrightDir = path.join(process.cwd(), 'playwright');
          const authDir = path.join(playwrightDir, '.auth');

          try {
            if (!fs.existsSync(playwrightDir)) {
              fs.mkdirSync(playwrightDir, { recursive: true });
            }
            if (!fs.existsSync(authDir)) {
              fs.mkdirSync(authDir, { recursive: true });
            }
            return null; // Indica que la tarea se completó sin errores
          } catch (error) {
            throw new Error(`Error creating directory: ${error.message}`);
          }
        },
        storeCredentials({ filePath, sessionData }) {
          try {
            const jsonContent = JSON.stringify(sessionData, null, 2);
            fs.writeFileSync(filePath, jsonContent, 'utf8');
            return null; // Indica que la tarea se completó sin errores
          } catch (error) {
            throw new Error(`Error writing file: ${error.message}`);
          }
        },
        async readCredentials(filePath) {
          try {
            const fileContent = await fs.readFile(filePath, 'utf8')
            return JSON.parse(fileContent)
          } catch (error) {
            console.error('Error reading credentials:', error)
            return null
          }
        }
      });
    },
    // baseUrl: 'http://localhost:8080/',
    baseUrl: 'https://agreeable-meadow-08dd7350f.2.azurestaticapps.net/#',
    supportFile: 'test/cypress/support/e2e.ts',
    specPattern: 'test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1366,
    viewportHeight: 768,
  },
  component: {
    // setupNodeEvents(on, config) {},
    supportFile: 'test/cypress/support/component.ts',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'test/cypress/support/component-index.html',
    devServer: injectQuasarDevServerConfig(),
    
  },
  projectId: 'qyxqts',
});
