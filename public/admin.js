// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, set, update } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

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

// Elements
const startGameButton = document.getElementById('startGame');
const endGameButton = document.getElementById('endGame');
const setGameTimeButton = document.getElementById('setGameTime');
const setTicketLimitButton = document.getElementById('setTicketLimit');
const bookTicketButton = document.getElementById('bookTicket');

startGameButton.addEventListener('click', () => {
    set(ref(database, 'gameInfo/status'), 'started');
    set(ref(database, 'gameInfo/board'), generateBoardNumbers());
});

endGameButton.addEventListener('click', () => {
    set(ref(database, 'gameInfo/status'), 'ended');
    set(ref(database, 'gameInfo/board'), null); // Clear the board
    set(ref(database, 'calledNumbers'), []);
});

setGameTimeButton.addEventListener('click', () => {
    const gameTime = prompt("Enter the game start time (YYYY-MM-DDTHH:MM:SSZ):");
    const gameDate = prompt("Enter the game start date (YYYY-MM-DD):");
    if (gameTime && gameDate) {
        update(ref(database, 'gameInfo'), {
            gameTime: gameTime,
            gameDate: gameDate
        });
    }
});

setTicketLimitButton.addEventListener('click', () => {
    const limit = prompt("Enter the number of tickets:");
    if (limit) {
        set(ref(database, 'tickets/limit'), parseInt(limit));
    }
});

bookTicketButton.addEventListener('click', () => {
    const ticketNumber = prompt("Enter the ticket number to book:");
    const ownerName = prompt("Enter the owner's name:");
    if (ticketNumber && ownerName) {
        update(ref(database, `tickets/${ticketNumber}`), {
            bookedBy: ownerName
        });
    }
});

function generateBoardNumbers() {
    const board = Array.from({ length: 90 }, (_, i) => i + 1);
    return board;
}
