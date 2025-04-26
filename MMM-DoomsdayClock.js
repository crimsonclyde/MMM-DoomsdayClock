Module.register("MMM-DoomsdayClock", {
    defaults: {
      updateInterval: 24 * 60 * 60 * 1000 // once per day
    },
  
    start() {
      this.clockData = "Unknown";
      this.advice = "Awaiting prepper wisdom...";
      this.adviceList = [];
      this.adviceIndex = 0;
      this.getClockData();
      this.scheduleUpdate();
    },
  
    getStyles() {
      return [
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css",
        "MMM-DoomsdayClock.css"
      ];
    },
  
    scheduleUpdate() {
      setInterval(() => {
        this.getClockData();
      }, this.config.updateInterval);
    },
  
    getClockData() {
      this.sendSocketNotification("GET_CLOCK_DATA");
    },
  
    socketNotificationReceived(notification, payload) {
      if (notification === "CLOCK_DATA") {
        this.clockData = payload.time;
        this.adviceList = payload.adviceList || [payload.advice];
        this.adviceIndex = 0;
        this.advice = this.adviceList[this.adviceIndex];
        this.updateDom();
        this.scheduleAdviceRotation();
      }
    },
  
    scheduleAdviceRotation() {
      clearInterval(this.adviceTimer);
      this.adviceTimer = setInterval(() => {
        this.adviceIndex = (this.adviceIndex + 1) % this.adviceList.length;
        this.advice = this.adviceList[this.adviceIndex];
        this.updateDom();
      }, 15000); // Change advice every 15 seconds
    },
  
    getDom() {
      const wrapper = document.createElement("div");
      wrapper.className = "doomsday-clock-wrapper";
  
      wrapper.innerHTML = `
        <div class="doomsday-title">
          <span class="title-text">Doomsday</span>
          <i class="fa fa-clock-o clock-icon"></i>
        </div>
        <hr class="doomsday-divider">
        <div class="clock-time">${this.clockData}</div>
        <hr class="doomsday-divider">
        <div class="prepper-section">
          <div class="prepper-title"><i class="fa fa-bomb"></i> <strong>Prepper advice:</strong></div>
          <div class="prepper-text">${this.advice}</div>
        </div>
      `;

  
      return wrapper;
    }
  });
  