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
    // Create a container for the date and time input elements
    const inputContainer = document.createElement('div');

    // Create a datetime-local input for selecting the game start time
    const dateTimeInput = document.createElement('input');
    dateTimeInput.type = 'datetime-local';
    dateTimeInput.id = 'gameDateTime';
    dateTimeInput.name = 'gameDateTime';

    // Create a submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Set Game Time';

    // Append the input and button to the container
    inputContainer.appendChild(dateTimeInput);
    inputContainer.appendChild(submitButton);

    // Append the container to the body or a specific part of the page
    document.body.appendChild(inputContainer);

    // Handle the click event on the submit button
    submitButton.addEventListener('click', () => {
        const selectedDateTime = dateTimeInput.value;

        if (selectedDateTime) {
            const [gameDate, gameTime] = selectedDateTime.split('T');

            // Update the game info in the database
            update(ref(database, 'gameInfo'), {
                gameTime: gameTime + ':00Z', // Adding seconds and timezone format
                gameDate: gameDate
            }).then(() => {
                alert('Game time and date set successfully!');
                document.body.removeChild(inputContainer); // Remove the input elements after setting the time
            }).catch(error => {
                alert('Error setting game time and date:', error);
            });
        } else {
            alert('Please select a valid date and time.');
        }
    });
});


setTicketLimitButton.addEventListener('click', () => {
    const limit = prompt("Enter the number of tickets:");
    if (limit) {
        const tickets = {};

        function generateTicket() {
            const ticketNumbers = Array(27).fill(null); // 3 rows x 9 columns = 27 cells
            const columnsArray = Array.from({ length: 9 }, () => []);

            // Populate columns with numbers in ascending order
            for (let col = 0; col < 9; col++) {
                const min = col * 10 + 1;
                const max = col === 8 ? 90 : (col + 1) * 10;

                for (let num = min; num <= max; num++) {
                    columnsArray[col].push(num);
                }
                columnsArray[col].sort((a, b) => a - b); // Ensure ascending order
            }

            // Assign numbers to the ticket ensuring 5 per row
            for (let row = 0; row < 3; row++) {
                const selectedColumns = new Set();

                while (selectedColumns.size < 5) {
                    const col = Math.floor(Math.random() * 9);
                    selectedColumns.add(col);
                }

                selectedColumns.forEach(col => {
                    const number = columnsArray[col].shift(); // Get the smallest number in ascending order
                    ticketNumbers[row * 9 + col] = number;
                });
            }

            return { numbers: ticketNumbers };
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



// Function to set awards in the Firebase database
document.getElementById('setAwardsButton').addEventListener('click', () => {
    const awards = {
        'Full House': {
            amount: document.getElementById('fullHouseAmount').value,
            winner: null
        },
        'Top Line': {
            amount: document.getElementById('topLineAmount').value,
            winner: null
        },
        'Middle Line': {
            amount: document.getElementById('middleLineAmount').value,
            winner: null
        },
        'Bottom Line': {
            amount: document.getElementById('bottomLineAmount').value,
            winner: null
        },
        'Four Corners': {
            amount: document.getElementById('fourCornersAmount').value,
            winner: null
        },
        'Early Five': {
            amount: document.getElementById('earlyFiveAmount').value,
            winner: null
        },
        'Odd-Even': {
            amount: document.getElementById('oddEvenAmount').value,
            winner: null
        },
        'Diagonal': {
            amount: document.getElementById('diagonalAmount').value,
            winner: null
        }
    };

    set(ref(database, 'gameInfo/awards'), awards)
        .then(() => alert('Awards set successfully!'))
        .catch(error => console.error('Error setting awards:', error));
});
