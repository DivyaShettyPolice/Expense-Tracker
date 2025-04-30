document.addEventListener('DOMContentLoaded', () => {
    const transactionForm = document.getElementById('transaction-form');
    const transactionsUl = document.getElementById('transactions');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const netIncomeEl = document.getElementById('net-income');
    const filterCategory = document.getElementById('filter-category');
    const expenseChartCtx = document.getElementById('expense-chart').getContext('2d');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let expenseChart;

    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('transaction-id').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value);

        if (!date || !description || !category || isNaN(amount)) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please fill all the fields correctly!',
            });
            return;
        }

        if (id) {
            // Edit existing transaction
            transactions = transactions.map(transaction =>
                transaction.id === Number(id)
                    ? { id: Number(id), date, description, category, amount }
                    : transaction
            );
            document.getElementById('transaction-id').value = '';
        } else {
            // Add new transaction
            const transaction = {
                id: Date.now(),
                date,
                description,
                category,
                amount
            };
            transactions.push(transaction);
        }

        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateTransactionsUI();
        updateSummary();
        updateChart();
        transactionForm.reset();

        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Transaction added/edited successfully!',
        });
    });

    filterCategory.addEventListener('change', () => {
        updateTransactionsUI();
    });

    function updateTransactionsUI() {
        transactionsUl.innerHTML = '';

        const filteredTransactions = transactions.filter(transaction => {
            if (filterCategory.value === 'All') {
                return true;
            }
            return transaction.category === filterCategory.value;
        });

        filteredTransactions.forEach(transaction => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.innerHTML = `
                <span>${transaction.date}</span> 
                <span>${transaction.description}</span>
                <span>${transaction.category}</span>
                <span>${transaction.amount.toFixed(2)}</span>
                <button class="btn btn-sm btn-warning" onclick="editTransaction(${transaction.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${transaction.id})">Delete</button>
            `;
            transactionsUl.appendChild(li);
        });
    }

    function updateSummary() {
        const totalIncome = transactions
            .filter(transaction => transaction.amount > 0)
            .reduce((acc, transaction) => acc + transaction.amount, 0);

        const totalExpenses = transactions
            .filter(transaction => transaction.amount < 0)
            .reduce((acc, transaction) => acc + transaction.amount, 0);

        totalIncomeEl.textContent = totalIncome.toFixed(2);
        totalExpensesEl.textContent = Math.abs(totalExpenses).toFixed(2);
        netIncomeEl.textContent = (totalIncome + totalExpenses).toFixed(2);
    }

    function updateChart() {
        const categorizedExpenses = transactions
            .filter(transaction => transaction.amount < 0)
            .reduce((acc, transaction) => {
                if (!acc[transaction.category]) {
                    acc[transaction.category] = 0;
                }
                acc[transaction.category] += Math.abs(transaction.amount);
                return acc;
            }, {});

        const chartData = {
            labels: Object.keys(categorizedExpenses),
            datasets: [{
                data: Object.values(categorizedExpenses),
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
                hoverBackgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56']
            }]
        };

        if (expenseChart) {
            expenseChart.destroy();
        }

        expenseChart = new Chart(expenseChartCtx, {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true
            }
        });
    }

    window.editTransaction = function(id) {
        const transaction = transactions.find(transaction => transaction.id === id);

        if (transaction) {
            document.getElementById('transaction-id').value = transaction.id;
            document.getElementById('date').value = transaction.date;
            document.getElementById('description').value = transaction.description;
            document.getElementById('category').value = transaction.category;
            document.getElementById('amount').value = transaction.amount;
        }

        window.scrollTo(0, 0);
    };

    window.deleteTransaction = function(id) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateTransactionsUI();
        updateSummary();
        updateChart();

        Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Transaction has been deleted.',
        });
    };

    // Initial load
    updateTransactionsUI();
    updateSummary();
    updateChart();
});