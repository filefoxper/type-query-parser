if (process.env.NODE_ENV === "production") {
    module.exports = require("./dist/type-query-parser.min.js");
} else {
    module.exports = require("./dist/type-query-parser.js");
}