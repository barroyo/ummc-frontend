importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

   /*Update with yours config*/
  const firebaseConfig = {
    apiKey: "AIzaSyA282vx5ZhdZwPtxhKSzCNfx5Zi5LJXGfs",
    authDomain: "ummccareshiv.firebaseapp.com",
    projectId: "ummccareshiv",
    storageBucket: "ummccareshiv.appspot.com",
    messagingSenderId: "722672967447",
    appId: "1:722672967447:web:4e7e56a27b490fa5676152"
 };
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(function (payload) {
    const promiseChain = clients
        .matchAll({
            type: "window",
            includeUncontrolled: true
        })
        .then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                const windowClient = windowClients[i];
                windowClient.postMessage('skipWaiting');
            }
        });
        self.registration.update();
    return promiseChain;
});
self.addEventListener('notificationclick', function (event) {
    console.log('notification received: ', event)
});