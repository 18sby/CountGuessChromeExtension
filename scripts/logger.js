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
  // First confirmation
  const firstConfirm = confirm(
    '⚠️ 警告：这将删除所有数据！\n\n' +
    '包括：\n' +
    '• 今天的计数\n' +
    '• 所有历史记录\n' +
    '• 导出提醒状态\n\n' +
    '此操作无法撤销！\n\n' +
    '确定要继续吗？'
  );
  
  if (!firstConfirm) {
    return false;
  }
  
  // Second confirmation - make user type to confirm
  const secondConfirm = confirm(
    '⚠️ 最后确认！\n\n' +
    '您即将永久删除所有数据。\n' +
    '这包括您的所有历史记录。\n\n' +
    '真的要删除吗？'
  );
  
  if (!secondConfirm) {
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
        alert('✓ 所有数据已清除。扩展将重新加载。');
        // Reload the extension
        window.location.reload();
        resolve(true);
      };
      
      deleteRequest.onerror = () => {
        console.error('Error deleting database:', deleteRequest.error);
        alert('❌ 删除数据库失败，请重试。');
        reject(deleteRequest.error);
      };
      
      deleteRequest.onblocked = () => {
        console.warn('Database deletion blocked. Attempting to force close...');
        // Try to reload anyway
        alert('数据库删除被阻止。扩展将重新加载以完成重置。');
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

/**
 * Reset only today's counters (keep history)
 */
async function resetTodayCounters() {
  // First confirmation
  const firstConfirm = confirm(
    '重置今天的计数？\n\n' +
    '这将把今天所有角色的计数重置为0。\n' +
    '历史记录不会被删除。\n\n' +
    '确定要继续吗？'
  );
  
  if (!firstConfirm) {
    return false;
  }
  
  // Second confirmation
  const secondConfirm = confirm(
    '确认重置今天的计数？\n\n' +
    '当前计数将全部变为0。\n' +
    '此操作无法撤销。'
  );
  
  if (!secondConfirm) {
    return false;
  }
  
  try {
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
    
    console.log('Today\'s counters reset successfully');
    alert('✓ 今天的计数已重置为0');
    
    // Reload to update UI
    window.location.reload();
    return true;
  } catch (error) {
    console.error('Error resetting today\'s counters:', error);
    alert('❌ 重置失败，请重试。');
    return false;
  }
}

console.log('Logger module loaded');
