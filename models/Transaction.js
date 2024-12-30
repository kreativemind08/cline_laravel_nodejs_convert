const Transaction = {
  tableName: 'Transactions',
  attributes: {
    id: {
      type: 'INTEGER',
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: 'INTEGER',
      allowNull: false,
    },
    payment_id: {
      type: 'INTEGER',
      allowNull: false,
    },
    amount: {
      type: 'DECIMAL(10, 2)',
      allowNull: false
    },
    timestamp: {
      type: 'DATE',
      default: 'NOW'
    },
    status: {
      type: 'ENUM',
      values: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
    // Add other relevant fields as needed
  },
  associate: (models) => {
    Transaction.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    })
    Transaction.belongsTo(models.Payment, {
      foreignKey: 'payment_id',
      as: 'payment'
    })
  }
}

module.exports = Transaction
