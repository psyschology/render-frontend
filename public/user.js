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

// Elements
const gameBoard = document.getElementById('gameBoard');
const nextGameTime = document.getElementById('nextGameTime');
const nextGameDate = document.getElementById('nextGameDate');
const timeLeft = document.getElementById('timeLeft');
const ticketsContainer = document.getElementById('tickets');
const calledNumbersContainer = document.getElementById('calledNumbers');

let calledNumbers = [];
let intervalId = null;

// Update UI based on game state
onValue(ref(database, 'gameInfo'), (snapshot) => {
    const gameInfo = snapshot.val();
    if (gameInfo) {
        nextGameTime.textContent = `Next Game Time: ${gameInfo.gameTime || 'N/A'}`;
        nextGameDate.textContent = `Next Game Date: ${gameInfo.gameDate || 'N/A'}`;
        
        // Calculate time left
        if (gameInfo.gameTime) {
            const now = new Date();
            const gameTime = new Date(gameInfo.gameTime);
            const timeDiff = gameTime - now;
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            timeLeft.textContent = `Time Left: ${hours}h ${minutes}m`;
        }
    } else {
        nextGameTime.textContent = 'Next Game Time: N/A';
        nextGameDate.textContent = 'Next Game Date: N/A';
        timeLeft.textContent = 'Time Left: N/A';
    }
});

onValue(ref(database, 'gameInfo/status'), (snapshot) => {
    const status = snapshot.val();
    if (status === 'started') {
        onValue(ref(database, 'gameInfo/board'), (snapshot) => {
            const board = snapshot.val();
            if (board) {
                gameBoard.style.display = 'block';
                generateBoard(board);
                startNumberCalling();
            }
        });
    } else if (status === 'ended') {
        gameBoard.style.display = 'none';
        stopNumberCalling();
    }
});

onValue(ref(database, 'calledNumbers'), (snapshot) => {
    const numbers = snapshot.val() || [];
    calledNumbersContainer.innerHTML = '';
    numbers.forEach(number => {
        updateCalledNumbers(number);
    });
});

// Listen for changes in the ticket limit and update UI
onValue(ref(database, 'tickets/limit'), (snapshot) => {
    const limit = snapshot.val();
    if (limit) {
        ticketsContainer.innerHTML = ''; // Clear the container
        for (let i = 1; i <= limit; i++) {
            const ticketDiv = document.createElement('div');
            ticketDiv.id = `ticket-${i}`;
            ticketDiv.innerHTML = `
                <div>Ticket ${i}</div>
                <div>
                    <a href="https://wa.me/99999" target="_blank">Book Now</a>
                </div>
                <div class="ticket-grid"></div>
            `;
            ticketsContainer.appendChild(ticketDiv);
        }
    }
});


// Handle updates to individual tickets
onValue(ref(database, 'tickets'), (snapshot) => {
    const tickets = snapshot.val();
    for (const [ticketNumber, ticket] of Object.entries(tickets)) {
        if (ticketNumber !== 'limit') {
            const ticketDiv = document.getElementById(`ticket-${ticketNumber}`);
            if (ticketDiv) {
                ticketDiv.querySelector('.ticket-grid').innerHTML = generateTicketGrid(ticket.numbers);
                if (ticket.bookedBy) {
                    ticketDiv.querySelector('a').textContent = `Booked by: ${ticket.bookedBy}`;
                }
            }
        }
    }
});
function generateTicketGrid(numbers) {
    let gridHtml = '<table>';
    for (let row = 0; row < 3; row++) {
        gridHtml += '<tr>';
        for (let col = 0; col < 9; col++) {
            const number = numbers.find(n => Math.floor((n - 1) / 10) === col);
            gridHtml += `<td class="${number ? 'highlight' : 'blocked'}">${number || ''}</td>`;
        }
        gridHtml += '</tr>';
    }
    gridHtml += '</table>';
    return gridHtml;
}
function generateBoard(board) {
    const table = document.createElement('table');
    for (let i = 0; i < 9; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < 10; j++) {
            const td = document.createElement('td');
            const num = board[i * 10 + j];
            td.textContent = num;
            td.id = `cell-${num}`;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    gameBoard.innerHTML = '';
    gameBoard.appendChild(table);
}

function startNumberCalling() {
    intervalId = setInterval(() => {
        const number = Math.floor(Math.random() * 90) + 1;
        updateCalledNumbers(number);
    }, 2000); // Adjust interval as needed
}

function stopNumberCalling() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

function updateCalledNumbers(number) {
    calledNumbers.push(number);
    const container = document.createElement('div');
    container.textContent = number;
    container.classList.add('highlight');
    calledNumbersContainer.appendChild(container);
    
    const cell = document.getElementById(`cell-${number}`);
    if (cell) {
        cell.classList.add('highlight');
    }
}

function generateTicketGrid(ticketNumber, ticket) {
    const container = document.getElementById(`ticket-${ticketNumber}`);
    if (!ticket || !ticket.numbers) return;

    const ticketNumbers = ticket.numbers;
    let gridHtml = '<table>';

    for (let row = 0; row < 3; row++) {
        gridHtml += '<tr>';
        const rowNumbers = ticketNumbers.filter((_, index) => Math.floor(index / 5) === row);
        let numberIndex = 0;
        for (let col = 0; col < 9; col++) {
            const number = rowNumbers.find(n => Math.floor((n - 1) / 10) === col + 1);
            if (number && numberIndex < 5) {
                gridHtml += `<td class="number-cell" data-number="${number}">${number}</td>`;
                numberIndex++;
            } else {
                gridHtml += '<td class="blocked"></td>';
            }
        }
        gridHtml += '</tr>';
    }
    gridHtml += '</table>';
    container.innerHTML = gridHtml;

    // Apply highlighting for called numbers if they exist
    calledNumbers.forEach((number) => {
        const cells = container.querySelectorAll(`[data-number="${number}"]`);
        cells.forEach(cell => cell.classList.add('highlight'));
    });
}
function setTicketLimit(limit) {
    const tickets = {};
    for (let i = 1; i <= limit; i++) {
        tickets[i] = {
            bookedBy: null,
            numbers: generateHousieNumbers()
        };
    }
    set(ref(database, 'tickets'), tickets);
}

function generateHousieNumbers() {
    const numbers = [];
    for (let i = 0; i < 3; i++) {
        let row = [];
        while (row.length < 5) {
            const num = Math.floor(Math.random() * 90) + 1;
            if (!numbers.includes(num)) {
                row.push(num);
                numbers.push(num);
            }
        }
    }
    return numbers.sort((a, b) => a - b);
}
