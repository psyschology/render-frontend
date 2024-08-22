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

// Prompt for password on page load
document.addEventListener('DOMContentLoaded', () => {
    const password = prompt('Enter password:');
    if (password !== 'jaybasotia') {
        alert('Incorrect password');
        window.location.href = 'about:blank'; // Redirect to a blank page if the password is incorrect
    }
});

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
        const tickets = {};

        function generateTicket() {
            const ticketNumbers = Array(27).fill(null); // 27 cells for the ticket
            const blockedIndices = [];

            // Allocate 5 numbers in each row
            for (let row = 0; row < 3; row++) {
                const availableIndices = [...Array(9).keys()];
                const selectedIndices = availableIndices.sort(() => 0.5 - Math.random()).slice(0, 5);

                selectedIndices.forEach(index => {
                    let min = index * 10 + 1;
                    let max = index * 10 + 10;
                    if (index === 0) min = 1; // Adjust for 1-9 range
                    if (index === 8) max = 90; // Adjust for 81-90 range
                    const possibleNumbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
                    const chosenNumber = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];
                    ticketNumbers[row * 9 + index] = chosenNumber;
                });

                // Store blocked indices for each row (those not selected)
                const blockedCols = availableIndices.filter(index => !selectedIndices.includes(index));
                blockedIndices.push(...blockedCols.map(i => row * 9 + i));
            }

            return { numbers: ticketNumbers, blockedIndices: blockedIndices };
        }

        // Generate tickets based on the specified limit
        for (let i = 1; i <= limit; i++) {
            tickets[i] = generateTicket();
        }

        // Store the tickets in Firebase
        set(ref(database, 'tickets'), tickets);
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


