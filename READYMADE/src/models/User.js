const Mongoose = require('mongoose')

const UserScheme = new Mongoose.Schema(
  {
    // unique fields: email
    // required fields: email, password, name, surname, title
    email: {
      type: String,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    title: { type: String, required: true },

    // Later we must create ornization model and reference here
    user_type: {
      type: String,
      enum: ['ADMIN', 'MEMBER', 'GUEST'],
      default: 'MEMBER',
    },

    passive: {
      is: { type: Boolean, default: false },
      type: {
        type: String,
        enum: ['NONE', 'DELETED', 'BLOCKED', 'SUSPENDED', 'PENDING'],
        default: 'NONE',
      },
      reason: { type: String, default: '' },
      passive_date: { type: Date, default: null },
    },

    privacy_policy: {
      accepted: { type: Boolean, default: false },
      accepted_date: { type: Date, default: null },
    },

    version: String,
  },
  { versionKey: false, timestamps: true }
)

// Virtuals Usage Examples:

// 1- Referencing
// UserScheme.virtual('wallet', {
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
UserScheme.set('toObject', { virtuals: true })
UserScheme.set('toJSON', { virtuals: true })

module.exports = Mongoose.model('users', UserScheme)
