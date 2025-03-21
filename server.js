const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");

const url = "https://create.roblox.com/docs/en-us/release-notes/release-notes-663";
const webhookURL = process.env.URL; // Replace with your actual webhook URL

async function scrapeReleaseNote() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Find the row (<tr>) that contains the sandboxing fix description
        const sandboxRow = $("tr").filter((_, el) => 
            $(el).text().includes("Fixes a bug where a sandbox escape could happen")
        );

        // Extract the sandboxing fix text
        const bugFixText = sandboxRow.find("p").text().trim();

        // Extract the corresponding state (e.g., Pending, Released)
        const stateInfo = sandboxRow.find("span.MuiChip-label").text().trim();

        if (bugFixText && stateInfo) {
            console.log("Bug Fix Text:", bugFixText);
            console.log("State:", stateInfo);
            sendToDiscord(stateInfo);
        } else {
            console.log("Sandboxing fix text or state info not found.");
        }

    } catch (error) {
        console.error("Error fetching the page:", error);
    }
}

async function sendToDiscord(stateInfo) {
    try {
        await axios.post(webhookURL, {
            content: `**Sandboxing Fix State:** ${stateInfo}`
        });

        console.log("Sent to Discord:", stateInfo);
    } catch (error) {
        console.error("Error sending to Discord:", error);
    }
}
scrapeReleaseNote()
// Schedule to run every 4 hours
cron.schedule("0 */4 * * *", () => {
    console.log("Checking for updates...");
    scrapeReleaseNote();
});
