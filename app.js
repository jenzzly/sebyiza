// Firebase configuration
const firebaseConfig = {
    // Add your Firebase configuration here
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Constants
const INITIAL_FUNDS = 50000;
const MONTHLY_CONTRIBUTION = 10000;
const INTEREST_RATE = 0.03;

// DOM elements
const currentBalanceElement = document.getElementById('current-balance');
const loanForm = document.getElementById('loan-form');
const loansList = document.getElementById('loans');

// Initialize fund
let currentBalance = INITIAL_FUNDS;

// Update balance display
function updateBalanceDisplay() {
    currentBalanceElement.textContent = currentBalance.toFixed(2);
}

// Apply for a loan
loanForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('loan-amount').value);
    const duration = parseInt(document.getElementById('loan-duration').value);

    if (amount > currentBalance) {
        alert('Insufficient funds for this loan.');
        return;
    }

    const interest = amount * INTEREST_RATE * (duration / 12);
    const totalRepayment = amount + interest;

    try {
        await db.collection('loans').add({
            amount,
            duration,
            interest,
            totalRepayment,
            dateIssued: new Date(),
            status: 'active'
        });

        currentBalance -= amount;
        updateBalanceDisplay();
        loadLoans();
        loanForm.reset();
    } catch (error) {
        console.error('Error adding loan: ', error);
    }
});

// Load and display loans
async function loadLoans() {
    loansList.innerHTML = '';
    try {
        const snapshot = await db.collection('loans').where('status', '==', 'active').get();
        snapshot.forEach((doc) => {
            const loan = doc.data();
            const li = document.createElement('li');
            li.textContent = `Amount: $${loan.amount}, Duration: ${loan.duration} months, Total Repayment: $${loan.totalRepayment.toFixed(2)}`;
            loansList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading loans: ', error);
    }
}

// Simulate monthly contribution
setInterval(() => {
    currentBalance += MONTHLY_CONTRIBUTION;
    updateBalanceDisplay();
}, 30000); // 30 seconds for demo purposes, change to 30 days (2592000000 ms) for production

// Initial setup
updateBalanceDisplay();
loadLoans();
