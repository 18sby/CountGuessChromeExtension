// Background service worker for daily reset monitoring
// This file will handle time-based events and daily reset logic

let lastCheckedDate = null;

/**
 * Initialize background service worker
 */
function initBackground() {
  console.log('Background service worker initialized');
  
  // Get initial date
  lastCheckedDate = new Date().toISOString().split('T')[0];
  
  // Set up periodic check (every minute)
  setInterval(checkForMidnight, 60000);
  
  // Also check on alarm
  chrome.alarms.create('dailyCheck', { periodInMinutes: 1 });
  chrome.alarms.onAlarm.addListener(handleAlarm);
}

/**
 * Check if midnight has passed
 */
function checkForMidnight() {
  const currentDate = new Date().toISOString().split('T')[0];
  
  if (lastCheckedDate !== currentDate) {
    console.log(`Date changed from ${lastCheckedDate} to ${currentDate}`);
    lastCheckedDate = currentDate;
    
    // Notify that reset is needed
    // The actual reset will happen when popup opens
    console.log('Daily reset will be triggered on next popup open');
  }
}

/**
 * Handle alarm events
 */
function handleAlarm(alarm) {
  if (alarm.name === 'dailyCheck') {
    checkForMidnight();
  }
}

// Initialize when service worker starts
initBackground();
