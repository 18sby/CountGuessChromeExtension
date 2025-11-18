// Performance optimization utilities

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function}
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Request animation frame wrapper for smooth animations
 * @param {Function} callback - Animation callback
 */
function smoothAnimate(callback) {
  if (window.requestAnimationFrame) {
    requestAnimationFrame(callback);
  } else {
    setTimeout(callback, 16); // ~60fps fallback
  }
}

/**
 * Batch IndexedDB operations to reduce transaction overhead
 */
class BatchedDBOperations {
  constructor() {
    this.queue = [];
    this.processing = false;
  }
  
  /**
   * Add operation to queue
   */
  add(operation) {
    this.queue.push(operation);
    if (!this.processing) {
      this.process();
    }
  }
  
  /**
   * Process queued operations
   */
  async process() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    
    this.processing = true;
    const operation = this.queue.shift();
    
    try {
      await operation();
    } catch (error) {
      console.error('Batched operation failed:', error);
    }
    
    // Process next operation
    smoothAnimate(() => this.process());
  }
}

// Global batch processor
const dbBatchProcessor = new BatchedDBOperations();

/**
 * Measure and log performance metrics
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }
  
  /**
   * Start timing an operation
   */
  start(label) {
    this.metrics[label] = performance.now();
  }
  
  /**
   * End timing and log result
   */
  end(label) {
    if (this.metrics[label]) {
      const duration = performance.now() - this.metrics[label];
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      delete this.metrics[label];
      return duration;
    }
    return 0;
  }
  
  /**
   * Measure popup load time
   */
  measurePopupLoad() {
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      console.log(`[Performance] Popup load time: ${loadTime}ms`);
      
      if (loadTime > 100) {
        console.warn('Popup load time exceeds target of 100ms');
      }
    }
  }
  
  /**
   * Monitor memory usage
   */
  checkMemoryUsage() {
    if (performance.memory) {
      const usedMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
      console.log(`[Performance] Memory usage: ${usedMB}MB`);
      
      if (usedMB > 10) {
        console.warn('Memory usage exceeds target of 10MB');
      }
    }
  }
}

// Global performance monitor
const perfMonitor = new PerformanceMonitor();

/**
 * Optimize animation performance
 */
function optimizeAnimations() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    console.log('Reduced motion preference detected, disabling animations');
    document.body.classList.add('reduce-motion');
  }
  
  // Add will-change hints sparingly
  const buttons = document.querySelectorAll('.character-button');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.willChange = 'transform';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.willChange = 'auto';
    });
  });
}

/**
 * Initialize performance optimizations
 */
function initPerformanceOptimizations() {
  // Optimize animations
  optimizeAnimations();
  
  // Measure initial load
  window.addEventListener('load', () => {
    perfMonitor.measurePopupLoad();
    perfMonitor.checkMemoryUsage();
  });
  
  console.log('Performance optimizations initialized');
}

console.log('Performance module loaded');
