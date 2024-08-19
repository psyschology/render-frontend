// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.getElementById('startGame').addEventListener('click', () => {
    database.ref('game').set({ status: 'started' });
    console.log('Game started');
});

document.getElementById('endGame').addEventListener('click', () => {
    database.ref('game').set({ status: 'ended' });
    console.log('Game ended');
});

document.getElementById('setGameTime').addEventListener('click', () => {
    const gameTime = prompt('Enter game time (YYYY-MM-DD HH:MM:SS)');
    const gameDate = prompt('Enter game date (YYYY-MM-DD)');
    database.ref('gameInfo').set({
        gameTime: gameTime,
        gameDate: gameDate
    });
    console.log('Game time and date set');
});

document.getElementById('setTicketLimit').addEventListener('click', () => {
    const ticketLimit = prompt('Enter the number of tickets');
    database.ref('tickets').set({ limit: ticketLimit });
    console.log('Ticket limit set');
});

document.getElementById('bookTicket').addEventListener('click', () => {
    const ticketNumber = prompt('Enter ticket number to book');
    const ownerName = prompt('Enter owner name');
    database.ref('tickets/' + ticketNumber).set({ bookedBy: ownerName });
    console.log('Ticket booked');
});
