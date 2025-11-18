// CSV Export functionality

/**
 * Generate CSV content from history records
 * @param {Array} historyRecords - Array of history records
 * @returns {string} CSV content
 */
function generateCSV(historyRecords) {
  // CSV header (English)
  const header = 'Date,Sneezy Boom,Stampy Sigh,Grumble Gus,Negative Ned';
  
  // Handle empty history
  if (!historyRecords || historyRecords.length === 0) {
    return header + '\n';
  }
  
  // Sort records by date
  const sortedRecords = historyRecords.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
  
  // Generate CSV rows
  const rows = sortedRecords.map(record => {
    const counters = record.counters;
    return [
      record.date,
      counters['sneezy-boom'] || 0,
      counters['stampy-sigh'] || 0,
      counters['grumble-gus'] || 0,
      counters['negative-ned'] || 0
    ].join(',');
  });
  
  // Combine header and rows
  return header + '\n' + rows.join('\n');
}

/**
 * Validate history data before export
 * @param {Array} historyRecords - Array of history records
 * @returns {boolean} True if valid
 */
function validateHistoryData(historyRecords) {
  if (!Array.isArray(historyRecords)) {
    console.error('History records is not an array');
    return false;
  }
  
  // Check each record has required fields
  for (const record of historyRecords) {
    if (!record.date || !record.counters) {
      console.error('Invalid record format:', record);
      return false;
    }
  }
  
  return true;
}

/**
 * Export history data as CSV
 * @returns {Promise<void>}
 */
async function exportHistoryToCSV() {
  try {
    // Get all history records
    const historyRecords = await getAllHistoryRecords();
    
    // Get current day's data and add it to the export
    const currentData = await getCurrentCounters();
    const today = new Date().toISOString().split('T')[0];
    
    // Create a combined array with history + current day
    const allRecords = [...historyRecords];
    
    // Check if today's data is already in history (shouldn't be, but just in case)
    const todayExists = allRecords.some(record => record.date === today);
    
    if (!todayExists && currentData.counters) {
      // Add today's data to the export
      allRecords.push({
        date: today,
        counters: currentData.counters
      });
    }
    
    // Validate data
    if (!validateHistoryData(allRecords)) {
      throw new Error('Invalid history data');
    }
    
    // Generate CSV content
    const csvContent = generateCSV(allRecords);
    
    // Create filename with current date
    const filename = `count-guess-history-${today}.csv`;
    
    // Trigger download
    downloadCSV(csvContent, filename);
    
    console.log(`CSV export successful with ${allRecords.length} records`);
    return true;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
}

console.log('Export module loaded');


/**
 * Download CSV file
 * @param {string} csvContent - CSV content
 * @param {string} filename - Filename for download
 */
function downloadCSV(csvContent, filename) {
  try {
    // Create Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    console.log(`CSV downloaded: ${filename}`);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    // Fallback: copy to clipboard
    copyToClipboard(csvContent);
    alert('Download failed. CSV content copied to clipboard instead.');
  }
}

/**
 * Copy text to clipboard (fallback)
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    console.log('Content copied to clipboard');
  } catch (error) {
    console.error('Error copying to clipboard:', error);
  }
}

/**
 * Handle export with retry option
 * @param {number} retryCount - Number of retries attempted
 * @returns {Promise<boolean>}
 */
async function handleExportWithRetry(retryCount = 0) {
  try {
    await exportHistoryToCSV();
    return true;
  } catch (error) {
    console.error(`Export attempt ${retryCount + 1} failed:`, error);
    
    if (retryCount < 2) {
      // Show retry option
      const retry = confirm('Export failed. Would you like to retry?');
      if (retry) {
        return handleExportWithRetry(retryCount + 1);
      }
    } else {
      alert('Export failed after multiple attempts. Please try again later.');
    }
    
    return false;
  }
}
