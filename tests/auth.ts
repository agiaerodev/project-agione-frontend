import { promises as fs } from 'fs'
import path from 'path'
import { config } from './config'

const authFile = 'playwright/.auth/user.json';
const API = `${config.apiBase}/api/profile/v1/auth/login`;

const parentDirectory = path.resolve(__dirname, '..');
        
const filePath = path.join(parentDirectory, authFile);

const createAuthFolder = async () => {
    const playwrightDir = path.join(process.cwd(), 'playwright');
    const authDir = path.join(playwrightDir, '.auth');
  
    try {
        await fs.mkdir(playwrightDir, { recursive: true });
    
        await fs.mkdir(authDir, { recursive: true });
    } catch (error) {
        console.error('Error creating directory:', error);
    }
}

const storeCredentials = async ({ sessionData }) => {
    const jsonContent = JSON.stringify(sessionData, null, 2);
    const parentDirectory = path.resolve(__dirname, '..');
    const filePath = path.join(parentDirectory, authFile);
  
    try {
      await fs.writeFile(filePath, jsonContent, 'utf8');
    } catch (error) {
      console.error('Error writing file:', error);
    }
}

const fetchLogin = async () => {
    const response = await fetch(API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "username": config.credentials.email,
            "password": config.credentials.password,
            "device": "Windows 10.0"
        })
    })

    const data = await response.json()
    return data.data
}

const insertUser = async ({ sessionData, nameLocalStorage }) => {
    const openRequest = window.indexedDB.open(nameLocalStorage);

    openRequest.onupgradeneeded = function() {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains('storage')) {
            db.createObjectStore('storage');
        }
    };

    openRequest.onsuccess = function() {
        const db = openRequest.result;
        const transaction = db.transaction("storage", "readwrite");
        const storage = transaction.objectStore("storage");
        const request = storage.add(sessionData, "sessionData");

        request.onsuccess = function() {
            console.log("Successful connection with indexedDB");
        };

        request.onerror = function() {
            console.log("Error", request.error);
        };
    };

    openRequest.onerror = function() {
        console.log("Error", openRequest.error);
    };
}

function getLocalStorageName(url) {
    try {
        const parsedUrl = new URL(url);
        const host = parsedUrl.hostname;
        const port = parsedUrl.port;
  
        if (host === 'localhost') {
            return `localhost${port ? `:${port}` : ''}DB`
        }
  
        const parts = host.split('.');
        if (parts.length < 2) return `${host}DB`

        const firstPart = parts[0]
        const middleParts = parts.slice(1, -1)

        const pascalPart = middleParts.map(part =>
        part
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/\s/g, '')
        ).join('');

        return `${firstPart}${pascalPart}DB`;
    } catch (error) {
        console.error('Invalid URL:', error);
        return null;
    }
}

export const createSession = async (page) => {
    const sessionData = await fetchLogin()
    const nameLocalStorage = getLocalStorageName(config.url)
    await page.evaluate(insertUser, { sessionData, nameLocalStorage })
    await createAuthFolder()
    await storeCredentials({ sessionData })
}

export const acquireAccount = async (page) => {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const sessionData = await JSON.parse(fileContent)
        const nameLocalStorage = getLocalStorageName(config.url)
        await page.evaluate(insertUser, { sessionData, nameLocalStorage })
    } catch (err) {
        console.error('Error reading or parsing JSON file:', err);
    }
}

