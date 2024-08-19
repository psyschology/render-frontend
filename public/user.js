// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to update game board
function updateGameBoard(data) {
    if (data.status === 'started') {
        document.getElementById('gameBoard').style.display = 'block';
        // Add game board logic here
    } else if (data.status === 'ended') {
        document.getElementById('gameBoard').style.display = 'none';
        // Add logic to hide game board
    }
}

// Listen for game updates
onValue(ref(database, 'game'), (snapshot) => {
    updateGameBoard(snapshot.val());
});

onValue(ref(database, 'gameInfo'), (snapshot) => {
    const gameInfo = snapshot.val();
    document.getElementById('nextGameTime').textContent = `Next Game Time: ${gameInfo.gameTime || 'N/A'}`;
    document.getElementById('nextGameDate').textContent = `Next Game Date: ${gameInfo.gameDate || 'N/A'}`;
    // Calculate and update time left
});

// Listen for ticket updates
onValue(ref(database, 'tickets'), (snapshot) => {
    const tickets = snapshot.val();
    // Update ticket containers
});
