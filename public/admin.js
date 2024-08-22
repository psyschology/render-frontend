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

function createTicket() {
    const ticket = Array(27).fill(null);
    const blockedIndices = [];

    for (let row = 0; row < 3; row++) {
        const selectedIndices = new Set();
        
        // Ensure that 5 columns are selected for each row
        while (selectedIndices.size < 5) {
            const randomIndex = Math.floor(Math.random() * 9);
            selectedIndices.add(randomIndex);
        }

        selectedIndices.forEach(index => {
            let min = index * 10 + 1;
            let max = index * 10 + 10;
            if (index === 0) min = 1;
            if (index === 8) max = 90;
            const possibleNumbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
            const chosenNumber = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];
            ticket[row * 9 + index] = chosenNumber;
        });

        // Mark remaining columns as blocked
        for (let col = 0; col < 9; col++) {
            if (!selectedIndices.has(col)) {
                blockedIndices.push(row * 9 + col);
            }
        }
    }

    return { numbers: ticket, blockedIndices };
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


