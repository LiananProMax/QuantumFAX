require("dotenv").config();

module.exports = {
    apiToken: process.env.API_TOKEN || "",
    enableAuth: process.env.ENABLE_AUTH === "true"
};
