// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, set, update } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

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

// Prompt for email and password on page load
document.addEventListener('DOMContentLoaded', () => {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    
    if (email && password) {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // User signed in successfully
                const user = userCredential.user;
                console.log('User signed in:', user.email);
            })
            .catch((error) => {
                // Authentication failed
                alert('Incorrect email or password');
                window.location.href = 'about:blank'; // Redirect to a blank page if authentication fails
            });
    } else {
        alert('Please enter both email and password');
        window.location.href = 'about:blank'; // Redirect to a blank page if email or password is missing
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
    const ticketNumbers = Array(27).fill(null); // Initialize a 3x9 grid with nulls
    const blockedIndices = [];
    const usedColumns = new Set(); // To track columns that have been used by numbers

    for (let row = 0; row < 3; row++) {
        const columns = [...Array(9).keys()]; // Array of column indices [0-8]
        columns.sort(() => 0.5 - Math.random()); // Shuffle the columns to randomize selection

        const selectedColumns = columns.slice(0, 5); // Select 5 columns randomly

        // Ensure each row does not share the exact pattern of columns
        while (usedColumns.has(selectedColumns.toString())) {
            columns.sort(() => 0.5 - Math.random());
            selectedColumns = columns.slice(0, 5);
        }
        usedColumns.add(selectedColumns.toString());

        for (const col of selectedColumns) {
            let min = col * 10 + 1; // Column's minimum value
            let max = col * 10 + 10; // Column's maximum value
            if (col === 0) min = 1;  // Adjust for 1-9 range
            if (col === 8) max = 90; // Adjust for 81-90 range

            const possibleNumbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
            let chosenNumber;

            // Ensure chosenNumber is unique within the ticket
            do {
                chosenNumber = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];
            } while (ticketNumbers.includes(chosenNumber));

            const index = row * 9 + col; // Calculate the index in the ticket array
            ticketNumbers[index] = chosenNumber; // Place the number in the correct cell
        }

        // Block the columns not selected for this row
        const blockedCols = Array.from({ length: 9 }, (_, i) => i).filter(i => !selectedColumns.includes(i));
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


