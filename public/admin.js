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
const auth = getAuth(app);

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
    const ticketNumbers = Array(27).fill(null); // 27 cells for the ticket
    const blockedIndices = [];

    // Define the column ranges
    const columnRanges = [
        [1, 9], [10, 19], [20, 29], [30, 39], [40, 49], 
        [50, 59], [60, 69], [70, 79], [80, 90]
    ];

    // Initialize the number set to ensure uniqueness across the entire ticket
    const usedNumbers = new Set();

    // Allocate 5 numbers in each row
    for (let row = 0; row < 3; row++) {
        const selectedIndices = [];

        // Select 5 unique columns for this row
        while (selectedIndices.length < 5) {
            const colIndex = Math.floor(Math.random() * 9);
            if (!selectedIndices.includes(colIndex)) {
                selectedIndices.push(colIndex);
            }
        }

        // Sort selected indices to maintain column order
        selectedIndices.sort((a, b) => a - b);

        selectedIndices.forEach(colIndex => {
            let [min, max] = columnRanges[colIndex];
            let num;

            // Generate a unique number for this column
            do {
                num = Math.floor(Math.random() * (max - min + 1)) + min;
            } while (usedNumbers.has(num));

            usedNumbers.add(num);
            ticketNumbers[row * 9 + colIndex] = num;
        });

        // Mark the remaining columns as blocked
        const blockedCols = [...Array(9).keys()].filter i => !selectedIndices.includes(i));
        blockedIndices.push(...blockedCols.map(i => row * 9 + i));
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


