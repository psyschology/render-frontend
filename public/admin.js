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

            for (let row = 0; row < 3; row++) {
                const rowNumbers = new Set();
                
                // Generate 5 unique numbers for the row
                while (rowNumbers.size < 5) {
                    const col = Math.floor(Math.random() * 9); // Choose a column randomly (0-8)
                    let num = Math.floor(Math.random() * 10) + 1 + (col * 10); // Generate number based on column range
                    
                    // Ensure the number is not already in the ticket and fits within the column range
                    if (!ticketNumbers.includes(num)) {
                        rowNumbers.add({ num, col });
                    }
                }

                // Sort row numbers by column to ensure proper placement
                const sortedRowNumbers = Array.from(rowNumbers).sort((a, b) => a.col - b.col);
                for (let { num, col } of sortedRowNumbers) {
                    const index = row * 9 + col; // Calculate the index in the ticket array
                    ticketNumbers[index] = num; // Place the number in the correct cell
                }

                // Determine which columns will be blocked
                const blockedCols = Array.from({ length: 9 }, (_, i) => i).filter(i => !sortedRowNumbers.some(({ col }) => col === i));
                blockedIndices.push(...blockedCols.map(col => row * 9 + col)); // Calculate blocked indices
            }

            return {
                numbers: ticketNumbers,
                blockedIndices: blockedIndices
            };
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
// Load award settings and display them in the admin interface
function loadAwardSettings() {
    onValue(ref(database, 'awardSettings'), (snapshot) => {
        const awards = snapshot.val();
        const awardsTable = document.getElementById('awardsTable');
        awardsTable.innerHTML = ''; // Clear previous content

        for (const [awardName, awardDetails] of Object.entries(awards)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${awardName}</td>
                <td><input type="number" id="${awardName}Amount" value="${awardDetails.amount || 0}" /></td>
            `;
            awardsTable.appendChild(row);
        }
    });
}

// Save award settings to Firebase
function saveAwardSettings() {
    const awards = {};
    const awardNames = ['fullHouse', 'firstRow']; // Add more awards as needed

    awardNames.forEach(name => {
        const amount = document.getElementById(`${name}Amount`).value;
        awards[name] = { amount: parseFloat(amount) };
    });

    set(ref(database, 'awardSettings'), awards);
}

// Event listener for the save button
document.getElementById('saveAwardsButton').addEventListener('click', saveAwardSettings);

// Initialize the settings when the admin page loads
loadAwardSettings();
