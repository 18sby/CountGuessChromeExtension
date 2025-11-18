// Logging and debugging utilities

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

let currentLogLevel = LOG_LEVELS.INFO;

/**
 * Logger class for consistent logging
 */
class Logger {
  constructor(module) {
    this.module = module;
  }
  
  debug(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.debug(`[${this.module}] ${message}`, ...args);
    }
  }
  
  info(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.info(`[${this.module}] ${message}`, ...args);
    }
  }
  
  warn(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn(`[${this.module}] ${message}`, ...args);
    }
  }
  
  error(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error(`[${this.module}] ${message}`, ...args);
    }
  }
  
  /**
   * Log reset event
   */
  logResetEvent(previousDate, counters) {
    this.info('Daily reset performed', {
      previousDate,
      counters,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Log export event
   */
  logExportEvent(recordCount) {
    this.info('Data exported', {
      recordCount,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Log counter update
   */
  logCounterUpdate(characterId, oldValue, newValue) {
    this.debug('Counter updated', {
      characterId,
      oldValue,
      newValue,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Create logger for a module
 */
function createLogger(module) {
  return new Logger(module);
}

/**
 * Set log level
 */
function setLogLevel(level) {
  currentLogLevel = level;
}

/**
 * Reset all data (for debugging/corruption recovery)
 */
async function resetAllData() {
  const confirmed = confirm(
    'WARNING: This will delete all your data including history records. ' +
    'This action cannot be undone. Are you sure you want to continue?'
  );
  
  if (!confirmed) {
    return false;
  }
  
  try {
    // Close the database connection first (using closeDB from db.js)
    if (typeof closeDB === 'function') {
      closeDB();
    }
    
    // Small delay to ensure connection is fully closed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Delete IndexedDB database
    const deleteRequest = indexedDB.deleteDatabase('CountGuessDB');
    
    return new Promise((resolve, reject) => {
      deleteRequest.onsuccess = () => {
        console.log('Database deleted successfully');
        // Clear localStorage as well
        localStorage.removeItem('countGuessCounters');
        alert('All data has been reset. The extension will reload now.');
        // Reload the extension
        window.location.reload();
        resolve(true);
      };
      
      deleteRequest.onerror = () => {
        console.error('Error deleting database:', deleteRequest.error);
        alert('Failed to delete database. Please try again.');
        reject(deleteRequest.error);
      };
      
      deleteRequest.onblocked = () => {
        console.warn('Database deletion blocked. Attempting to force close...');
        // Try to reload anyway
        alert('Database deletion was blocked. The extension will reload to complete the reset.');
        window.location.reload();
        reject(new Error('Database deletion blocked'));
      };
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    alert('Failed to reset data. Please try again.');
    return false;
  }
}

console.log('Logger module loaded');
