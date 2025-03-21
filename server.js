const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");

const url = "https://create.roblox.com/docs/en-us/release-notes/release-notes-663";
const webhookURL = process.env.URL; // Replace with actual webhook URL

// Tracks the last known state in memory
let lastState = "Pending"; 

async function scrapeReleaseNote() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Find the row containing the sandboxing fix
        const sandboxRow = $("tr").filter((_, el) =>
            $(el).text().includes("Fixes a bug where a sandbox escape could happen")
        );

        // Extract the bug fix text and corresponding state
        const bugFixText = sandboxRow.find("p").text().trim();
        const stateInfo = sandboxRow.find("span.MuiChip-label").text().trim();

        if (bugFixText && stateInfo) {
            console.log("Bug Fix Text:", bugFixText);
            console.log("State:", stateInfo);

            if (lastState === "Pending" && stateInfo === "Live") {
                await sendToDiscord(`${bugFixText} ${stateInfo} <@472385006665465857>`);
                console.log("State is 'Live', stopping further checks.");
                process.exit(0); // Stop execution
            } else {
				 await sendToDiscord(`${bugFixText} ${stateInfo} are we there yet?`);
                console.log("No state change to 'Live' detected.");
            }

            lastState = stateInfo; // Update last known state in memory
        } else {
            console.log("Sandboxing fix text or state info not found.");
        }

    } catch (error) {
        console.error("Error fetching the page:", error);
    }
}
async function sendToDiscord(message) {
    try {
        await axios.post(webhookURL, { content: message });
        console.log("Sent to Discord:", message);
    } catch (error) {
        console.error("Error sending to Discord:", error);
    }
}

// Schedule to run every 4 hours
cron.schedule("0 */4 * * *", () => {
    console.log("Checking for updates...");
    scrapeReleaseNote();
});

// Initial run
scrapeReleaseNote();
