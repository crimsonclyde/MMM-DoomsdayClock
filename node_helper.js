const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

module.exports = NodeHelper.create({
  start() {
    console.log("MMM-DoomsdayClock helper started...");
    this.adviceList = [];
    this.loadAdvice();
  },

  loadAdvice() {
    const file = path.join(__dirname, "advice.json");
    try {
      const content = fs.readFileSync(file, "utf8");
      this.adviceList = JSON.parse(content);
      console.log(`[MMM-DoomsdayClock] Loaded ${this.adviceList.length} advice groups`);
    } catch (e) {
      console.error("Failed to load advice.json:", e);
    }
  },

  getAdviceList(secondsToMidnight) {
    for (let group of this.adviceList) {
      if (secondsToMidnight <= group.maxSeconds) {
        return group.advice || [];
      }
    }
    return ["Everything’s fine. Probably."];
  },

  async fetchClockData() {
    try {
      const response = await fetch("https://thebulletin.org/doomsday-clock/");
      const body = await response.text();
      const $ = cheerio.load(body);

      const sentence = $("h2:contains('seconds to midnight')").first().text().trim();
      const match = sentence.match(/(\d+)\s+seconds\s+to\s+midnight/i);
      const secondsToMidnight = match ? parseInt(match[1], 10) : 0;

      const adviceList = this.getAdviceList(secondsToMidnight);

      this.sendSocketNotification("CLOCK_DATA", {
        time: sentence || "Time data not found.",
        secondsToMidnight,
        adviceList
      });
    } catch (error) {
      console.error("Error fetching Doomsday Clock data:", error);
      this.sendSocketNotification("CLOCK_DATA", {
        time: "Error fetching data.",
        secondsToMidnight: 0,
        adviceList: ["Stay calm and refresh."]
      });
    }
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "GET_CLOCK_DATA") {
      this.fetchClockData();
    }
  }
});

