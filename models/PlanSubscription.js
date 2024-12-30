const PlanSubscription = {
  tableName: 'PlanSubscriptions',
  attributes: {
    id: {
      type: 'INTEGER',
      primaryKey: true,
      autoIncrement: true
    },
    currentPlan: {
      type: 'INTEGER',
      default: 0
    }
  }
}

module.exports = PlanSubscription
