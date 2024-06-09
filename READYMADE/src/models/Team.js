const Mongoose = require('mongoose')

const TeamScheme = new Mongoose.Schema(
  {
    // unique fields: -
    // required fields: name, owners, members
    name: { type: String, required: true },
    owners: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'users' }],
    members: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'users' }],

    passive: {
      is: { type: Boolean, default: false },
      type: {
        type: String,
        enum: ['NONE', 'DELETED', 'BLOCKED', 'SUSPENDED'],
        default: 'NONE',
      },
      reason: { type: String, default: '' },
      passive_date: { type: Date, default: null },
    },

    version: String,
  },
  { versionKey: false, timestamps: true }
)

// Virtuals Usage Examples:

// 1- Referencing
// TeamScheme.virtual('wallet', {
//   ref: 'wallets',
//   localField: '_id',
//   foreignField: 'user',
//   justOne: true,
// })

// 2- Create a Virtual Property
// WalletScheme.virtual('balance').get(function () {
//   return this.transactions
//     .filter(function (transaction) {
//       const last_status = transaction.status == 'SUCCESSED' && transaction.type != -2
//       return last_status
//     })
//     .reduce((total, transaction) => (total += transaction.amount * transaction.type), 0)
// })

// 3- Virtuals Options
TeamScheme.set('toObject', { virtuals: true })
TeamScheme.set('toJSON', { virtuals: true })

module.exports = Mongoose.model('teams', TeamScheme)
