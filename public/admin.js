// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9hgV5BCLAXQC4-MhcEfadzJCRVcwp8CQ",
  authDomain: "render-27de6.firebaseapp.com",
  databaseURL: "https://render-27de6-default-rtdb.firebaseio.com",
  projectId: "render-27de6",
  storageBucket: "render-27de6.appspot.com",
  messagingSenderId: "401163347854",
  appId: "1:401163347854:web:d95d1a655d256c731766df",
  measurementId: "G-M87PVBCQJN"
};
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.getElementById('startGame').addEventListener('click', () => {
    // Logic to start the game
    database.ref('game').set({ status: 'started' });
});

document.getElementById('endGame').addEventListener('click', () => {
    // Logic to end the game
    database.ref('game').set({ status: 'ended' });
});

// Add more logic for other buttons
