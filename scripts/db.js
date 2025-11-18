// IndexedDB database layer
// This file will handle all database operations

const DB_NAME = 'CountGuessDB';
const DB_VERSION = 1;

// Object store names
const STORES = {
  DAILY_COUNTERS: 'dailyCounters',
  HISTORY_RECORDS: 'historyRecords',
  APP_STATE: 'appState'
};

let db = null;

/**
 * Initialize IndexedDB database
 * Creates three object stores: dailyCounters, historyRecords, appState
 * @returns {Promise<IDBDatabase>}
 */
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('Database failed to open:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      db = request.result;
      console.log('Database opened successfully');
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      db = event.target.result;
      console.log('Database upgrade needed, creating object stores...');
      
      // Create dailyCounters object store
      if (!db.objectStoreNames.contains(STORES.DAILY_COUNTERS)) {
        const dailyCountersStore = db.createObjectStore(STORES.DAILY_COUNTERS, { keyPath: 'id' });
        console.log('Created dailyCounters object store');
      }
      
      // Create historyRecords object store with date index
      if (!db.objectStoreNames.contains(STORES.HISTORY_RECORDS)) {
        const historyStore = db.createObjectStore(STORES.HISTORY_RECORDS, { keyPath: 'date' });
        historyStore.createIndex('date', 'date', { unique: true });
        console.log('Created historyRecords object store with date index');
      }
      
      // Create appState object store
      if (!db.objectStoreNames.contains(STORES.APP_STATE)) {
        const appStateStore = db.createObjectStore(STORES.APP_STATE, { keyPath: 'id' });
        console.log('Created appState object store');
      }
    };
  });
}

/**
 * Get the database instance, initializing if necessary
 * @returns {Promise<IDBDatabase>}
 */
async function getDB() {
  if (!db) {
    await initDB();
  }
  return db;
}

console.log('Database module loaded');

/**
 * Get current daily counters
 * @returns {Promise<Object>} Current counters object or default values
 */
async function getCurrentCounters() {
  try {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.DAILY_COUNTERS], 'readonly');
      const store = transaction.objectStore(STORES.DAILY_COUNTERS);
      const request = store.get('current');
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          // Return default counters if none exist
          const today = new Date().toISOString().split('T')[0];
          resolve({
            id: 'current',
            date: today,
            counters: {
              'sneezy-boom': 0,
              'stampy-sigh': 0,
              'grumble-gus': 0,
              'negative-ned': 0
            },
            lastUpdated: Date.now()
          });
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting current counters:', error);
    // Fallback to localStorage
    return getCountersFromLocalStorage();
  }
}

/**
 * Update current daily counters
 * @param {Object} countersData - Counters data to save
 * @returns {Promise<void>}
 */
async function updateCurrentCounters(countersData) {
  try {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.DAILY_COUNTERS], 'readwrite');
      const store = transaction.objectStore(STORES.DAILY_COUNTERS);
      const request = store.put(countersData);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error updating current counters:', error);
    // Fallback to localStorage
    saveCountersToLocalStorage(countersData);
  }
}

/**
 * Save history record for a specific date
 * @param {string} date - ISO date string
 * @param {Object} counters - Counter values for all characters
 * @returns {Promise<void>}
 */
async function saveHistoryRecord(date, counters) {
  try {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.HISTORY_RECORDS], 'readwrite');
      const store = transaction.objectStore(STORES.HISTORY_RECORDS);
      const request = store.put({ date, counters });
      
      request.onsuccess = () => {
        console.log(`History saved for ${date}`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving history record:', error);
    throw error;
  }
}

/**
 * Get all history records
 * @returns {Promise<Array>} Array of history records
 */
async function getAllHistoryRecords() {
  try {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.HISTORY_RECORDS], 'readonly');
      const store = transaction.objectStore(STORES.HISTORY_RECORDS);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting history records:', error);
    return [];
  }
}

/**
 * Get app state (export reminder, etc.)
 * @param {string} stateId - State identifier
 * @returns {Promise<Object>}
 */
async function getAppState(stateId) {
  try {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.APP_STATE], 'readonly');
      const store = transaction.objectStore(STORES.APP_STATE);
      const request = store.get(stateId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting app state:', error);
    return null;
  }
}

/**
 * Update app state
 * @param {string} stateId - State identifier
 * @param {Object} stateData - State data to save
 * @returns {Promise<void>}
 */
async function updateAppState(stateId, stateData) {
  try {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.APP_STATE], 'readwrite');
      const store = transaction.objectStore(STORES.APP_STATE);
      const request = store.put({ id: stateId, ...stateData });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error updating app state:', error);
    throw error;
  }
}

// LocalStorage fallback functions
function getCountersFromLocalStorage() {
  const stored = localStorage.getItem('countGuessCounters');
  if (stored) {
    return JSON.parse(stored);
  }
  const today = new Date().toISOString().split('T')[0];
  return {
    id: 'current',
    date: today,
    counters: {
      'sneezy-boom': 0,
      'stampy-sigh': 0,
      'grumble-gus': 0,
      'negative-ned': 0
    },
    lastUpdated: Date.now()
  };
}

function saveCountersToLocalStorage(countersData) {
  localStorage.setItem('countGuessCounters', JSON.stringify(countersData));
}

/**
 * Close database connection
 */
function closeDB() {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}
