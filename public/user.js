// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, onValue, set } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

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
const calledNumbersTableContainer = document.getElementById('calledNumbersTable'); // New element for the called numbers table

let calledNumbers = [];
let intervalId = null;
let numberPool = []; // To hold shuffled numbers 1-90

// Initialize the number pool
function initializeNumberPool() {
    numberPool = Array.from({ length: 90 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
}

// Update UI based on game state
onValue(ref(database, 'gameInfo'), (snapshot) => {
    const gameInfo = snapshot.val();
    
    if (gameInfo) {
        nextGameTime.textContent = `Next Game Time: ${gameInfo.gameTime || 'N/A'}`;
        nextGameDate.textContent = `Next Game Date: ${gameInfo.gameDate || 'N/A'}`;

        if (gameInfo.gameTime && gameInfo.gameDate) {
            // Combine game date and time into a single Date object
            const gameDateTime = new Date(`${gameInfo.gameDate}T${gameInfo.gameTime}`);

            // Clear any existing interval to prevent multiple intervals running at the same time
            if (window.countdownInterval) {
                clearInterval(window.countdownInterval);
            }

            // Set up a countdown timer
            window.countdownInterval = setInterval(() => {
                const now = new Date();
                const timeDiff = gameDateTime - now;

                if (timeDiff > 0) {
                    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

                    timeLeft.textContent = `Time Left: ${hours}h ${minutes}m ${seconds}s`;
                } else {
                    // Time is up, clear the interval and update the display
                    clearInterval(window.countdownInterval);
                    timeLeft.textContent = 'Time Left: 0h 0m 0s';
                }
            }, 1000); // Update every second
        } else {
            timeLeft.textContent = 'Time Left: N/A';
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
        initializeNumberPool();
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
    calledNumbers = numbers;
    updateCalledNumbersTable();
    calledNumbersContainer.innerHTML = numbers.map(number => `<span class="called-number">${number}</span>`).join(' ');

    // Update board with called numbers
    numbers.forEach(number => {
        const cell = document.getElementById(`cell-${number}`);
        if (cell) {
            cell.classList.add('called');
            cell.style.backgroundColor = 'yellow'; // Mark the cell in yellow
        }
    });

    // Update tickets with called numbers
    updateTicketsWithCalledNumbers();
});

// Fetch the tickets and render them
onValue(ref(database, 'tickets'), (snapshot) => {
    const tickets = snapshot.val();
    ticketsContainer.innerHTML = ''; // Clear previous content

    for (const [ticketNumber, ticket] of Object.entries(tickets)) {
        if (ticketNumber !== 'limit') {
            const ticketDiv = document.createElement('div');
            ticketDiv.className = 'dynamic-ticket'; // Add class for styling
            ticketDiv.innerHTML = `
                <div class="ticket-header">Ticket ${ticketNumber}</div>
                <div class="ticket-owner">
                    ${ticket.bookedBy ? `Booked by: ${ticket.bookedBy}` : `<a href="https://wa.me/99999" target="_blank">Book Now</a>`}
                </div>
                <div id="ticket-${ticketNumber}" class="ticket-grid"></div>
            `;
            ticketsContainer.appendChild(ticketDiv);

            const ticketGrid = document.getElementById(`ticket-${ticketNumber}`);
            const table = document.createElement('table');
            table.className = 'ticket-table'; // Add a class for styling

            for (let i = 0; i < 3; i++) {
                const tr = document.createElement('tr');
                for (let j = 0; j < 9; j++) {
                    const td = document.createElement('td');
                    const number = ticket.numbers[i * 9 + j];

                    if (number !== null) {
                        td.className = 'filled'; // Filled cells
                        td.textContent = number;
                        if (calledNumbers.includes(number)) {
                            td.classList.add('called'); // Highlight called numbers
                        }
                    } else {
                        td.className = 'blocked'; // Blocked cells
                    }

                    tr.appendChild(td);
                }
                table.appendChild(tr);
            }
            ticketGrid.appendChild(table);
        }
    }
});



function generateTicketNumbers() {
    const numbers = [];
    const columns = 9; // 9 columns
    const rows = 3; // 3 rows
    const columnRanges = [
        [1, 9],
        [10, 19],
        [20, 29],
        [30, 39],
        [40, 49],
        [50, 59],
        [60, 69],
        [70, 79],
        [80, 90]
    ];

    // Initialize columns with arrays to store numbers
    const columnsArray = Array.from({ length: columns }, () => []);

    // Populate each column with numbers in ascending order
    columnRanges.forEach((range, colIndex) => {
        for (let num = range[0]; num <= range[1]; num++) {
            columnsArray[colIndex].push(num);
        }
    });

    // Shuffle numbers within each column to distribute randomly
    columnsArray.forEach(col => {
        col.sort(() => Math.random() - 0.5);
    });

    // Fill rows with numbers
    for (let row = 0; row < rows; row++) {
        numbers[row] = [];
        for (let col = 0; col < columns; col++) {
            numbers[row][col] = columnsArray[col].shift(); // Get one number from the column
        }
    }

    // Ensure each row has exactly 5 numbers
    numbers.forEach(row => {
        while (row.length < 9) {
            row.push(null); // Fill remaining cells with null
        }
    });

    return numbers;
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
        if (numberPool.length > 0) {
            const number = numberPool.shift(); // Take the first number from the shuffled pool
            updateCalledNumbers(number);
            announceNumber(number);
        } else {
            stopNumberCalling();
        }
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
    set(ref(database, 'calledNumbers'), calledNumbers);
    const container = document.getElementById(`cell-${number}`);
    if (container) {
        container.classList.add('called');
        container.style.backgroundColor = 'yellow'; // Mark the cell in yellow
    }
    updateTicketsWithCalledNumbers(); // Update ticket grids when a number is called
    updateCalledNumbersTable(); // Update the called numbers table
}

function updateCalledNumbersTable() {
    const table = document.createElement('table');
    table.className = 'called-numbers-table'; // Add class for styling

    let row = document.createElement('tr');
    table.appendChild(row);

    // Fill the table with called numbers, dividing into rows of up to 22 columns
    calledNumbers.forEach((number, index) => {
        if (index % 22 === 0 && index !== 0) {
            row = document.createElement('tr');
            table.appendChild(row);
        }
        const cell = document.createElement('td');
        cell.textContent = number;
        cell.className = 'called'; // Add class to highlight called numbers
        row.appendChild(cell);
    });

    // Add empty cells to fill out the last row if necessary
    const totalCells = Math.ceil(calledNumbers.length / 22) * 22;
    const emptyCells = totalCells - calledNumbers.length;
    for (let i = 0; i < emptyCells; i++) {
        const cell = document.createElement('td');
        cell.className = 'empty'; // Class for empty cells
        row.appendChild(cell);
    }

    calledNumbersTableContainer.innerHTML = ''; // Clear previous content
    calledNumbersTableContainer.appendChild(table);
}

function updateTicketsWithCalledNumbers() {
    const tickets = document.getElementsByClassName('ticket-table');
    Array.from(tickets).forEach(ticket => {
        Array.from(ticket.getElementsByTagName('td')).forEach(cell => {
            const number = parseInt(cell.textContent);
            if (calledNumbers.includes(number)) {
                cell.classList.add('called');
                cell.style.backgroundColor = 'yellow'; // Mark the cell in yellow
            }
        });
    });
}

function announceNumber(number) {
    const msg = new SpeechSynthesisUtterance(number.toString());
    msg.lang = 'en-IN'; // Set language for Indian English accent
    speechSynthesis.speak(msg);
}

function generateTicket() {
    const ticketNumbers = Array(27).fill(null); // 3 rows x 9 columns = 27 cells
    const columnsArray = Array.from({ length: 9 }, () => []);

    // Populate columns with numbers in ascending order
    for (let col = 0; col < 9; col++) {
        const min = col * 10 + 1;
        const max = col === 8 ? 90 : (col + 1) * 10 - 1;

        for (let num = min; num <= max; num++) {
            columnsArray[col].push(num);
        }
    }

    // Shuffle columns to add randomness
    columnsArray.forEach(col => col.sort(() => Math.random() - 0.5));

    // Assign numbers to the ticket ensuring 5 per row
    for (let row = 0; row < 3; row++) {
        const selectedColumns = new Set();

        // Ensure 5 columns are selected
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




// Existing code...

// Show or hide awards based on game status
function updateAwardDisplay() {
    const awardBox = document.getElementById('awardBox');
    const gameStatusRef = ref(database, 'gameInfo/status'); // Check game status

    onValue(gameStatusRef, (snapshot) => {
        const gameStatus = snapshot.val();
        if (gameStatus === 'started') {
            awardBox.style.display = 'block'; // Show awards if game is running
            loadAwards(); // Load and display awards if the game is running
        } else {
            awardBox.style.display = 'none';  // Hide awards otherwise
        }
    });
}

function loadAwards() {
    const awardBox = document.getElementById('awardBox');
    const awardsRef = ref(database, 'gameInfo/awards'); // Correct path to awards data in Firebase

    onValue(awardsRef, (snapshot) => {
        const awards = snapshot.val();
        awardBox.innerHTML = ''; // Clear previous awards
        
        for (const [awardName, awardData] of Object.entries(awards)) {
            const awardContainer = document.createElement('div');
            awardContainer.className = 'award-container';

            const awardTitle = document.createElement('div');
            awardTitle.className = 'award-name';
            awardTitle.textContent = awardName;

            const viewWinnerButton = document.createElement('button');
            viewWinnerButton.className = 'view-winner-button';
            viewWinnerButton.textContent = 'View Winner';
            viewWinnerButton.addEventListener('click', () => {
                const winnerDetails = awardContainer.querySelector('.winner-details');
                if (winnerDetails.style.display === 'none') {
                    winnerDetails.style.display = 'block';
                    updateWinnerDetails(winnerDetails, awardData);
                } else {
                    winnerDetails.style.display = 'none';
                }
            });

            const winnerDetails = document.createElement('div');
            winnerDetails.className = 'winner-details';
            winnerDetails.style.display = 'none'; // Hide by default

            awardContainer.appendChild(awardTitle);
            awardContainer.appendChild(viewWinnerButton);
            awardContainer.appendChild(winnerDetails);
            awardBox.appendChild(awardContainer);
        }
    });
}

function updateWinnerDetails(winnerDetailsElement, awardData) {
    if (awardData.winner) {
        winnerDetailsElement.innerHTML = `
            <p>Ticket Number: ${awardData.winner.ticketNumber}</p>
            <p>Owner: ${awardData.winner.owner}</p>
        `;
    } else {
        winnerDetailsElement.innerHTML = '<p class="no-winner-message">No winners yet</p>';
    }
}

updateAwardDisplay(); // Call this function to initialize display

// Check for winning tickets and update awardBox
function checkAwards() {
    onValue(ref(database, 'calledNumbers'), (snapshot) => {
        const calledNumbers = snapshot.val() || [];
        onValue(ref(database, 'tickets'), (snapshot) => {
            const tickets = snapshot.val();
            for (const [ticketNumber, ticket] of Object.entries(tickets)) {
                const ticketNumbers = ticket.numbers;
                checkAwardsForTicket(ticketNumber, ticketNumbers, calledNumbers);
            }
        });
    });
}

// Function to check awards for a specific ticket
function checkAwardsForTicket(ticketNumber, ticketNumbers, calledNumbers) {
    const awardsRef = ref(database, 'gameInfo/awards');
    get(awardsRef).then((snapshot) => {
        const awards = snapshot.val();
        const winners = [];

        if (checkFullHouse(ticketNumbers, calledNumbers)) {
            winners.push('Full House');
        }
        if (checkLine(ticketNumbers, calledNumbers, 'top')) {
            winners.push('Top Line');
        }
        if (checkLine(ticketNumbers, calledNumbers, 'middle')) {
            winners.push('Middle Line');
        }
        if (checkLine(ticketNumbers, calledNumbers, 'bottom')) {
            winners.push('Bottom Line');
        }
        if (checkFourCorners(ticketNumbers, calledNumbers)) {
            winners.push('Four Corners');
        }
        if (checkEarlyFive(ticketNumbers, calledNumbers)) {
            winners.push('Early Five');
        }
        if (checkOddEven(ticketNumbers, calledNumbers)) {
            winners.push('Odd-Even');
        }
        if (checkDiagonal(ticketNumbers, calledNumbers)) {
            winners.push('Diagonal');
        }

        if (winners.length > 0) {
            announceWinners(winners, ticketNumber);
        }
    });
}

// Function to announce winners and update Firebase
function announceWinners(winners, ticketNumber) {
    const awardBox = document.getElementById('awardBox');
    awardBox.innerHTML += `<br>Ticket ${ticketNumber} won: ${winners.join(', ')}`;
    
    const updates = {};
    winners.forEach((award) => {
        updates[`gameInfo/awards/${award}/winner`] = {
            ticketNumber: ticketNumber,
            owner: 'Unknown' // Replace with actual owner if available
        };
    });
    update(ref(database), updates);
}

// Helper functions
function checkFullHouse(ticketNumbers, calledNumbers) {
    return ticketNumbers.every(number => calledNumbers.includes(number));
}

function checkLine(ticketNumbers, calledNumbers, lineType) {
    const lines = {
        top: ticketNumbers.slice(0, 9),
        middle: ticketNumbers.slice(9, 18),
        bottom: ticketNumbers.slice(18, 27)
    };
    return lines[lineType].every(number => calledNumbers.includes(number));
}

function checkFourCorners(ticketNumbers, calledNumbers) {
    const corners = [
        ticketNumbers[0], // Top-left
        ticketNumbers[8], // Top-right
        ticketNumbers[18], // Bottom-left
        ticketNumbers[26] // Bottom-right
    ];
    return corners.every(number => calledNumbers.includes(number));
}

function checkEarlyFive(ticketNumbers, calledNumbers) {
    const markedNumbers = ticketNumbers.filter(number => calledNumbers.includes(number));
    return markedNumbers.length >= 5;
}

function checkOddEven(ticketNumbers, calledNumbers) {
    const oddNumbers = ticketNumbers.filter(number => number % 2 !== 0);
    const evenNumbers = ticketNumbers.filter(number => number % 2 === 0);
    const allOdd = oddNumbers.every(number => calledNumbers.includes(number));
    const allEven = evenNumbers.every(number => calledNumbers.includes(number));
    return allOdd || allEven;
}

function checkDiagonal(ticketNumbers, calledNumbers) {
    const diagonals = [
        [ticketNumbers[0], ticketNumbers[10], ticketNumbers[20]], // Top-left to bottom-right
        [ticketNumbers[8], ticketNumbers[16], ticketNumbers[24]] // Top-right to bottom-left
    ];
    return diagonals.some(diagonal => diagonal.every(number => calledNumbers.includes(number)));
}






//test

    const ticketSearchBar = document.getElementById('ticketSearchBar');

// Function to render tickets based on the search query
function renderTickets(tickets) {
    const ticketsContainer = document.getElementById('tickets');
    ticketsContainer.innerHTML = '';

    for (const [ticketNumber, ticket] of Object.entries(tickets)) {
        if (ticketNumber !== 'limit') {
            const ticketDiv = document.createElement('div');
            ticketDiv.className = 'dynamic-ticket';
            ticketDiv.innerHTML = `
                <div class="ticket-header">Ticket ${ticketNumber}</div>
                <div class="ticket-owner">
                    ${ticket.bookedBy ? `Booked by: ${ticket.bookedBy}` : `<a href="https://wa.me/99999" target="_blank">Book Now</a>`}
                </div>
                <div id="ticket-${ticketNumber}" class="ticket-grid"></div>
            `;
            ticketsContainer.appendChild(ticketDiv);

            const ticketGrid = document.getElementById(`ticket-${ticketNumber}`);
            const table = document.createElement('table');
            table.className = 'ticket-table';

            for (let i = 0; i < 3; i++) {
                const tr = document.createElement('tr');
                for (let j = 0; j < 9; j++) {
                    const index = i * 9 + j;
                    const td = document.createElement('td');

                    if (ticket.numbers[index] !== null) {
                        td.className = 'filled';
                        td.textContent = ticket.numbers[index];
                    } else {
                        td.className = 'blocked';
                    }

                    tr.appendChild(td);
                }
                table.appendChild(tr);
            }
            ticketGrid.appendChild(table);
        }
    }
}

// Function to filter tickets based on search query
function filterTickets(query) {
    get(ref(database, 'tickets')).then((snapshot) => {
        const tickets = snapshot.val();
        if (tickets) {
            const filteredTickets = {};
            for (const [ticketNumber, ticket] of Object.entries(tickets)) {
                if (ticketNumber.includes(query) || (ticket.bookedBy && ticket.bookedBy.toLowerCase().includes(query.toLowerCase()))) {
                    filteredTickets[ticketNumber] = ticket;
                }
            }
            renderTickets(filteredTickets);
        }
    });
}

// Event listener for search input
ticketSearchBar.addEventListener('input', (e) => {
    const query = e.target.value;
    filterTickets(query);
});

// Initial call to render all tickets
get(ref(database, 'tickets')).then((snapshot) => {
    const tickets = snapshot.val();
    if (tickets) {
        renderTickets(tickets);
    }
});
