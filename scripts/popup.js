// Popup initialization and main logic

// Character configuration
const CHARACTERS = [
  {
    id: 'sneezy-boom',
    label: 'Sneezy Boom',
    themeColor: '#E53E3E',
    icon: '💥'
  },
  {
    id: 'stampy-sigh',
    label: 'Stampy Sigh',
    themeColor: '#3182CE',
    icon: '😮‍💨'
  },
  {
    id: 'grumble-gus',
    label: 'Grumble Gus',
    themeColor: '#38A169',
    icon: '😠'
  },
  {
    id: 'negative-ned',
    label: 'Negative Ned',
    themeColor: '#D69E2E',
    icon: '😔'
  }
];

const MAX_DAILY_COUNT = 300;

// Current state
let currentCounters = {};
let baguetteAnimationEnabled = true;

/**
 * Initialize the popup
 */
async function initPopup() {
  try {
    // Initialize performance optimizations
    initPerformanceOptimizations();
    
    // Load animation setting
    loadAnimationSetting();
    
    // Initialize database
    await initDB();
    
    // Check for daily reset
    await checkAndPerformDailyReset();
    
    // Load current counters
    const countersData = await getCurrentCounters();
    currentCounters = countersData.counters;
    
    // Render UI
    renderCounters();
    
    // Bind event listeners
    bindEventListeners();
    
    // Check and display export reminder
    await checkExportReminder();
    
    console.log('Popup initialized successfully');
  } catch (error) {
    console.error('Error initializing popup:', error);
    showError('Failed to initialize. Please try again.');
  }
}

/**
 * Bind event listeners to character buttons
 */
function bindEventListeners() {
  // Character button clicks
  const buttons = document.querySelectorAll('.character-button');
  buttons.forEach(button => {
    button.addEventListener('click', handleCharacterClick);
  });
  
  // Export button
  const exportBtn = document.getElementById('export-btn');
  exportBtn.addEventListener('click', handleExport);
  
  // Reset today button
  const resetTodayBtn = document.getElementById('reset-today-btn');
  resetTodayBtn.addEventListener('click', resetTodayCounters);
  
  // Reset all data button
  const resetBtn = document.getElementById('reset-data-btn');
  resetBtn.addEventListener('click', resetAllData);
  
  // Dismiss reminder button
  const dismissBtn = document.getElementById('dismiss-reminder-btn');
  dismissBtn.addEventListener('click', dismissExportReminder);
  
  // Debug button
  const debugBtn = document.getElementById('debug-db-btn');
  debugBtn.addEventListener('click', toggleDebugInfo);
  
  // Animation toggle
  const animationToggle = document.getElementById('baguette-animation-toggle');
  animationToggle.addEventListener('change', handleAnimationToggle);
}

/**
 * Handle character button click
 */
async function handleCharacterClick(event) {
  const button = event.currentTarget;
  const characterId = button.dataset.character;
  
  // Check if button is disabled
  if (button.classList.contains('disabled')) {
    return;
  }
  
  // Get current count
  const currentCount = currentCounters[characterId] || 0;
  
  // Check if already at max
  if (currentCount >= MAX_DAILY_COUNT) {
    return;
  }
  
  // Increment counter
  currentCounters[characterId] = currentCount + 1;
  
  // Save to database
  const today = new Date().toISOString().split('T')[0];
  await updateCurrentCounters({
    id: 'current',
    date: today,
    counters: currentCounters,
    lastUpdated: Date.now()
  });
  
  // Update UI
  updateCharacterUI(characterId, currentCounters[characterId]);
  
  // Trigger button press animation
  button.classList.add('animate-click');
  setTimeout(() => button.classList.remove('animate-click'), 300);
  
  // Create and animate baguette if enabled
  if (baguetteAnimationEnabled) {
    const hammer = document.createElement('div');
    hammer.className = 'hammer-icon';
    hammer.textContent = '🥖';
    button.appendChild(hammer);
    
    // Trigger hammer animation
    setTimeout(() => hammer.classList.add('animate'), 10);
    
    // Remove hammer after animation
    setTimeout(() => {
      if (hammer.parentNode) {
        hammer.parentNode.removeChild(hammer);
      }
    }, 600);
  }
  
  // Check if reached max
  if (currentCounters[characterId] >= MAX_DAILY_COUNT) {
    disableCharacterButton(characterId);
  }
}

/**
 * Update character UI (progress bar and count display)
 */
function updateCharacterUI(characterId, count) {
  const card = document.querySelector(`.character-card[data-character="${characterId}"]`);
  if (!card) return;
  
  // Update count display
  const countDisplay = card.querySelector('.count-display');
  countDisplay.textContent = `${count}/${MAX_DAILY_COUNT}`;
  
  // Update progress bar
  const progressBar = card.querySelector('.progress-bar');
  const percentage = (count / MAX_DAILY_COUNT) * 100;
  progressBar.style.width = `${percentage}%`;
  
  // Trigger flash animation on progress bar
  progressBar.classList.add('flash-progress');
  setTimeout(() => progressBar.classList.remove('flash-progress'), 300);
}

/**
 * Disable character button when max count reached
 */
function disableCharacterButton(characterId) {
  const button = document.querySelector(`.character-button[data-character="${characterId}"]`);
  if (!button) return;
  
  button.classList.add('disabled');
  button.classList.add('flash');
}

/**
 * Render all counters on initial load
 */
function renderCounters() {
  CHARACTERS.forEach(character => {
    const count = currentCounters[character.id] || 0;
    updateCharacterUI(character.id, count);
    
    // Disable button if at max
    if (count >= MAX_DAILY_COUNT) {
      disableCharacterButton(character.id);
    }
  });
}

/**
 * Show error message to user
 */
function showError(message) {
  console.error(message);
  
  // Create error element if it doesn't exist
  let errorElement = document.getElementById('error-message');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'error-message';
    errorElement.className = 'error-message';
    document.body.appendChild(errorElement);
  }
  
  // Set message and show
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorElement.classList.add('hidden');
  }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPopup);
} else {
  initPopup();
}

console.log('Count Guess popup loaded');

// Debug function to inspect database
async function debugDatabase() {
  console.log('=== Database Debug Info ===');
  
  const current = await getCurrentCounters();
  console.log('Current counters:', current);
  
  const history = await getAllHistoryRecords();
  console.log('History records:', history);
  
  const reminder = await getAppState('exportReminder');
  console.log('Export reminder state:', reminder);
  
  console.log('=== End Debug Info ===');
}

// Expose debug function to console
window.debugDatabase = debugDatabase;

/**
 * Toggle debug info display
 */
async function toggleDebugInfo() {
  const debugDiv = document.getElementById('debug-info');
  
  if (debugDiv.classList.contains('hidden')) {
    // Show debug info
    const current = await getCurrentCounters();
    const history = await getAllHistoryRecords();
    
    let html = '<div style="margin-top: 8px; padding: 8px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 0.7rem; text-align: left;">';
    html += '<strong>Current Day:</strong><br>';
    html += `Date: ${current.date}<br>`;
    html += `Sneezy: ${current.counters['sneezy-boom']}, `;
    html += `Stampy: ${current.counters['stampy-sigh']}, `;
    html += `Grumble: ${current.counters['grumble-gus']}, `;
    html += `Ned: ${current.counters['negative-ned']}<br><br>`;
    
    html += `<strong>History Records: ${history.length}</strong><br>`;
    if (history.length > 0) {
      history.slice(-3).forEach(record => {
        html += `${record.date}: S:${record.counters['sneezy-boom']} T:${record.counters['stampy-sigh']} G:${record.counters['grumble-gus']} N:${record.counters['negative-ned']}<br>`;
      });
    } else {
      html += '<em>No history yet (resets at midnight)</em>';
    }
    html += '</div>';
    
    debugDiv.innerHTML = html;
    debugDiv.classList.remove('hidden');
  } else {
    // Hide debug info
    debugDiv.classList.add('hidden');
  }
}

/**
 * Load animation setting from localStorage
 */
function loadAnimationSetting() {
  const saved = localStorage.getItem('baguetteAnimationEnabled');
  if (saved !== null) {
    baguetteAnimationEnabled = saved === 'true';
  }
  
  // Update checkbox state
  const checkbox = document.getElementById('baguette-animation-toggle');
  if (checkbox) {
    checkbox.checked = baguetteAnimationEnabled;
  }
}

/**
 * Handle animation toggle change
 */
function handleAnimationToggle(event) {
  baguetteAnimationEnabled = event.target.checked;
  localStorage.setItem('baguetteAnimationEnabled', baguetteAnimationEnabled.toString());
  console.log('Baguette animation:', baguetteAnimationEnabled ? 'enabled' : 'disabled');
}


/**
 * Check if daily reset is needed and perform it
 */
async function checkAndPerformDailyReset() {
  try {
    const countersData = await getCurrentCounters();
    const today = new Date().toISOString().split('T')[0];
    const storedDate = countersData.date;
    
    // Check if date has changed
    if (storedDate !== today) {
      console.log(`Date changed from ${storedDate} to ${today}, performing daily reset`);
      await performDailyReset(storedDate, countersData.counters);
    }
  } catch (error) {
    console.error('Error checking daily reset:', error);
  }
}

/**
 * Perform daily reset
 * @param {string} previousDate - Previous date
 * @param {Object} previousCounters - Previous day's counters
 */
async function performDailyReset(previousDate, previousCounters) {
  try {
    // Save previous day's data to history
    await saveHistoryRecord(previousDate, previousCounters);
    console.log(`Saved history for ${previousDate}`);
    
    // Reset all counters to 0
    const today = new Date().toISOString().split('T')[0];
    const resetCounters = {
      'sneezy-boom': 0,
      'stampy-sigh': 0,
      'grumble-gus': 0,
      'negative-ned': 0
    };
    
    await updateCurrentCounters({
      id: 'current',
      date: today,
      counters: resetCounters,
      lastUpdated: Date.now()
    });
    
    // Update current state
    currentCounters = resetCounters;
    
    // Trigger reset animation
    await animateReset();
    
    // Re-enable all buttons
    enableAllButtons();
    
    console.log('Daily reset completed successfully');
  } catch (error) {
    console.error('Error performing daily reset:', error);
  }
}

/**
 * Animate the reset with fade-out and fade-in
 */
async function animateReset() {
  return new Promise((resolve) => {
    const cards = document.querySelectorAll('.character-card');
    
    // Fade out
    cards.forEach(card => card.classList.add('fade-out'));
    
    setTimeout(() => {
      // Reset UI
      renderCounters();
      
      // Fade in
      cards.forEach(card => {
        card.classList.remove('fade-out');
        card.classList.add('fade-in');
      });
      
      setTimeout(() => {
        cards.forEach(card => card.classList.remove('fade-in'));
        resolve();
      }, 250);
    }, 250);
  });
}

/**
 * Enable all character buttons
 */
function enableAllButtons() {
  const buttons = document.querySelectorAll('.character-button');
  buttons.forEach(button => {
    button.classList.remove('disabled');
    button.classList.remove('flash');
  });
}


/**
 * Handle export button click
 */
async function handleExport() {
  try {
    const success = await handleExportWithRetry();
    
    if (success) {
      // Dismiss export reminder after successful export
      await dismissExportReminder(true);
      alert('Data exported successfully!');
    }
  } catch (error) {
    console.error('Error handling export:', error);
    showError('Failed to export data. Please try again.');
  }
}


/**
 * Check if export reminder should be displayed
 */
async function checkExportReminder() {
  try {
    const today = new Date();
    const dayOfMonth = today.getDate();
    
    // Get reminder state from database
    let reminderState = await getAppState('exportReminder');
    
    // Initialize if doesn't exist
    if (!reminderState) {
      reminderState = {
        isVisible: false,
        displayStartDate: null,
        lastExportDate: null
      };
    }
    
    // Check if it's the 1st of the month
    if (dayOfMonth === 1 && !reminderState.isVisible) {
      // Start showing reminder
      reminderState.isVisible = true;
      reminderState.displayStartDate = today.toISOString().split('T')[0];
      await updateAppState('exportReminder', reminderState);
    }
    
    // Check if reminder should still be visible
    if (reminderState.isVisible && reminderState.displayStartDate) {
      const startDate = new Date(reminderState.displayStartDate);
      const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      
      // Auto-dismiss after 7 days
      if (daysSinceStart >= 7) {
        reminderState.isVisible = false;
        await updateAppState('exportReminder', reminderState);
      }
    }
    
    // Show or hide reminder UI
    const reminderElement = document.getElementById('export-reminder');
    if (reminderState.isVisible) {
      reminderElement.classList.remove('hidden');
    } else {
      reminderElement.classList.add('hidden');
    }
  } catch (error) {
    console.error('Error checking export reminder:', error);
  }
}


/**
 * Dismiss export reminder
 * @param {boolean} exported - Whether dismissal is due to successful export
 */
async function dismissExportReminder(exported = false) {
  try {
    const reminderState = await getAppState('exportReminder') || {};
    
    // Update state
    reminderState.isVisible = false;
    
    if (exported) {
      reminderState.lastExportDate = new Date().toISOString().split('T')[0];
    }
    
    await updateAppState('exportReminder', reminderState);
    
    // Hide reminder UI
    const reminderElement = document.getElementById('export-reminder');
    reminderElement.classList.add('hidden');
    
    console.log('Export reminder dismissed');
  } catch (error) {
    console.error('Error dismissing export reminder:', error);
  }
}
