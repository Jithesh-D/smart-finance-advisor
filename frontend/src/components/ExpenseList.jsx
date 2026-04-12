import React from "react";

const ExpenseList = ({ transactions, onDeleteTransaction }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="transactions-card">
      <h3>Recent Transactions</h3>
      {transactions.length === 0 ? (
        <p>No transactions yet. Add your first transaction!</p>
      ) : (
        <div className="transactions-list">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-description">
                  {transaction.description}
                  <span className="transaction-date">
                    {formatDate(transaction.date)}
                  </span>
                </div>
                <div className="transaction-category">
                  {transaction.category}
                </div>
              </div>
              <div className={`transaction-amount ${transaction.type}`}>
                {transaction.type === "income" ? "+" : "-"}$
                {transaction.amount.toFixed(2)}
              </div>
              <button
                onClick={() => onDeleteTransaction(transaction._id)}
                className="btn delete-btn"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
