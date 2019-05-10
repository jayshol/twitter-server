exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://mytwitter:mytwitter123@ds125896.mlab.com:25896/twitter-db';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || 'mysecret';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';