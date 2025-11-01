// Initialize transactions from localStorage or empty array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const transactionList = document.getElementById('transaction-list');
const balanceElement = document.getElementById('balance');
const totalIncomeElement = document.getElementById('total-income');
const totalExpensesElement = document.getElementById('total-expenses');
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');
const clearAllButton = document.getElementById('clear-all');

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    setupEventListeners();
    updateUI();
});

// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Form submission
    transactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addTransaction();
    });
    
    // Filter changes
    filterType.addEventListener('change', updateUI);
    filterCategory.addEventListener('change', updateUI);
    
    // Clear all button
    clearAllButton.addEventListener('click', clearAllTransactions);
    
    console.log('Event listeners setup complete');
}

// Add a new transaction
function addTransaction() {
    console.log('Adding transaction...');
    
    const desc = document.getElementById('desc').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    
    // Validation
    if (!desc) {
        alert('Please enter a description');
        return;
    }
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    // Create transaction object
    const transaction = {
        id: Date.now(), // Unique ID
        desc: desc,
        amount: amount,
        type: type,
        category: category,
        date: new Date().toISOString()
    };
    
    console.log('New transaction:', transaction);
    
    // Add to transactions array
    transactions.push(transaction);
    console.log('Total transactions:', transactions.length);
    
    // Update UI
    updateUI();
    
    // Reset form
    transactionForm.reset();
    
    // Show success message
    alert('Transaction added successfully!');
}

// Delete a transaction
function deleteTransaction(id) {
    console.log('Deleting transaction:', id);
    
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        updateUI();
        alert('Transaction deleted successfully!');
    }
}

// Clear all transactions
function clearAllTransactions() {
    console.log('Clearing all transactions...');
    
    if (confirm('Are you sure you want to delete ALL transactions? This cannot be undone.')) {
        transactions = [];
        updateUI();
        alert('All transactions cleared!');
    }
}

// Update the UI
function updateUI() {
    console.log('Updating UI...');
    
    // Get filter values
    const typeFilter = filterType.value;
    const categoryFilter = filterCategory.value;
    
    console.log('Active filters - Type:', typeFilter, 'Category:', categoryFilter);
    
    // Filter transactions
    let filteredTransactions = transactions.filter(transaction => {
        const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
        const categoryMatch = categoryFilter === 'all' || transaction.category === categoryFilter;
        
        return typeMatch && categoryMatch;
    });
    
    console.log('Filtered transactions:', filteredTransactions.length);
    
    // Update balance and totals with ALL transactions
    updateBalanceAndTotals(transactions);
    
    // Update transaction list with filtered transactions
    updateTransactionList(filteredTransactions);
    
    // Save to localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    console.log('UI update complete');
}

// Update balance and totals
function updateBalanceAndTotals(transactions) {
    console.log('Updating balance and totals...');
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpenses += transaction.amount;
        }
    });
    
    const balance = totalIncome - totalExpenses;
    
    console.log('Calculated - Balance:', balance, 'Income:', totalIncome, 'Expenses:', totalExpenses);
    
    // Update DOM
    balanceElement.textContent = `₹${balance.toFixed(2)}`;
    balanceElement.className = `balance ${balance >= 0 ? 'positive' : 'negative'}`;
    
    totalIncomeElement.textContent = `₹${totalIncome.toFixed(2)}`;
    totalExpensesElement.textContent = `₹${totalExpenses.toFixed(2)}`;
}

// Update transaction list
function updateTransactionList(transactions) {
    console.log('Updating transaction list with', transactions.length, 'transactions');
    
    const list = document.getElementById('transaction-list');
    
    // Clear current list
    list.innerHTML = '';
    
    // Show empty state if no transactions
    if (transactions.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>No transactions found</h3>
                <p>Try changing your filters or add a new transaction</p>
            </div>
        `;
        console.log('Showing empty state');
        return;
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add each transaction to the list
    transactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        
        const iconClass = transaction.type === 'income' ? 'income-icon' : 'expense-icon';
        const icon = transaction.type === 'income' ? 'fas fa-arrow-down' : 'fas fa-arrow-up';
        const amountClass = transaction.type === 'income' ? 'income-amount' : 'expense-amount';
        const amountSign = transaction.type === 'income' ? '+' : '-';
        
        transactionItem.innerHTML = `
            <div class="transaction-details">
                <div class="transaction-icon ${iconClass}">
                    <i class="${icon}"></i>
                </div>
                <div class="transaction-info">
                    <h4>${transaction.desc}</h4>
                    <p>${formatCategory(transaction.category)} • ${formatDate(transaction.date)}</p>
                </div>
            </div>
            <div class="transaction-amount ${amountClass}">
                ${amountSign}₹${transaction.amount.toFixed(2)}
            </div>
            <div class="transaction-actions">
                <button class="btn-icon" onclick="deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        list.appendChild(transactionItem);
    });
    
    console.log('Transaction list updated');
}

// Helper function to format category for display
function formatCategory(category) {
    const categoryMap = {
        salary: 'Salary',
        food: 'Food & Dining',
        shopping: 'Shopping',
        transport: 'Transportation',
        bills: 'Bills',
        other: 'Other'
    };
    
    return categoryMap[category] || category;
}

// Helper function to format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}