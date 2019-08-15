'use strict'
const url = 'mongodb+srv://archangel:candela17@myfirstcluster-o8wr5.mongodb.net/blogAppThinkful224?retryWrites=true&w=majority';
exports.DATABASE_URL = process.env.DATABASE_URL || url;
exports.PORT = process.env.PORT || 8008;
