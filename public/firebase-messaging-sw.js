// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js');
importScripts('/service-worker.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object

const initializingFirebaseApp = async () => {
    try {
        const md5Hash = CryptoJS.MD5(`https://one.allianceground.com${moment().format('YYYY-MM-DD')}firebase`).toString();
        const response = await fetch(`https://staging-siembra-coffe.ozonohosting.com/api/notification/v1/providers/firebase?filter={%22field%22:%20%22system_name%22}&token=${md5Hash}`);
        const json = await response.json();
    
        if(json.errors === 'Unauthorized') {
            resolve(response);
            return
        };

        firebase.initializeApp({
            apiKey: json.data.fields.firebaseApiKey,
            authDomain: json.data.fields.firebaseAuthDomain,
            projectId: json.data.fields.firebaseProjectId,
            storageBucket: json.data.fields.firebaseStorageBucket,
            messagingSenderId: json.data.fields.firebaseMessagingSenderId,
            appId: json.data.fields.firebaseAppId,
            measurementId: json.data.fields.firebaseMeasurementId
        });
    
    
        // Retrieve an instance of Firebase Messaging so that it can handle background
        // messages.
        const messaging = firebase.messaging();
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}

self.addEventListener('install', (event) => {
    event.waitUntil(initializingFirebaseApp());
});