const { I18n } = require('i18n')
const path = require('path')

const translate = new I18n({
  locales: ['en', 'tr'],
  defaultLocale: 'en',
  directory: path.join(__dirname, '../langs'),
})
module.exports = translate
