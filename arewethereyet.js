const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");

const url = "https://create.roblox.com/docs/en-us/release-notes/release-notes-663";
const webhookURL = secret; // Replace this with your actual webhook URL

async function scrapeReleaseNote() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Extract the state info (Pending, Released, etc.)
        const stateInfo = $("span.MuiChip-label").first().text().trim();

        if (stateInfo) {
            console.log("State:", stateInfo);
            sendToDiscord(stateInfo);
        } else {
            console.log("No state info found.");
        }

    } catch (error) {
        console.error("Error fetching the page:", error);
    }
}

async function sendToDiscord(stateInfo) {
    try {
        await axios.post(webhookURL, {
            content: `**Release Note State:** ${stateInfo}`
        });

        console.log("Sent to Discord:", stateInfo);
    } catch (error) {
        console.error("Error sending to Discord:", error);
    }
}

// Schedule to run every 4 hours
cron.schedule("0 */4 * * *", () => {
    console.log("Checking for updates...");
    scrapeReleaseNote();
});
