/**
 * Safe Console Logger
 * Filters emojis from console outputs to prevent encoding issues
 */

// Comprehensive emoji regex pattern
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]/gu;

/**
 * Emoji to text mapping for better readability
 */
const EMOJI_MAP = {
  '✅': '[SUCCESS]',
  '❌': '[ERROR]',
  '⚠️': '[WARNING]',
  'ℹ️': '[INFO]',
  '🎉': '[CELEBRATION]',
  '💈': '[BARBER]',
  '✂️': '[SCISSORS]',
  '📅': '[CALENDAR]',
  '⏰': '[CLOCK]',
  '👤': '[USER]',
  '📧': '[EMAIL]',
  '🔧': '[SETTINGS]',
  '🌐': '[WEB]',
  '🔗': '[LINK]',
  '📊': '[CHART]',
  '🧹': '[CLEAN]',
  '🔄': '[REFRESH]',
  '💡': '[IDEA]',
  '🚀': '[LAUNCH]',
  '📱': '[MOBILE]',
  '💻': '[COMPUTER]',
  '🎯': '[TARGET]',
  '⭐': '[STAR]',
  '🏆': '[TROPHY]',
  '🎊': '[PARTY]',
  '🔥': '[FIRE]',
  '💯': '[HUNDRED]',
  '👍': '[THUMBS_UP]',
  '👎': '[THUMBS_DOWN]',
  '❤️': '[HEART]',
  '💚': '[GREEN_HEART]',
  '💙': '[BLUE_HEART]',
  '💜': '[PURPLE_HEART]',
  '🧡': '[ORANGE_HEART]',
  '💛': '[YELLOW_HEART]'
};

/**
 * Clean text by replacing emojis with text alternatives
 * @param {string} text - Text that may contain emojis
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
  if (typeof text !== 'string') {
    return text;
  }
  
  try {
    let result = text;
    
    // Replace known emojis with text alternatives
    Object.keys(EMOJI_MAP).forEach(emoji => {
      result = result.replace(new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), EMOJI_MAP[emoji]);
    });
    
    // Remove any remaining emojis
    result = result.replace(EMOJI_REGEX, '');
    
    return result.trim();
  } catch (error) {
    // Fallback: remove all non-ASCII characters except common punctuation
    return text.replace(/[^\x00-\x7F]/g, '').trim();
  }
}

/**
 * Process arguments to clean emojis
 * @param {Array} args - Console arguments
 * @returns {Array} - Cleaned arguments
 */
function processArgs(args) {
  return args.map(arg => {
    if (typeof arg === 'string') {
      return cleanText(arg);
    }
    return arg;
  });
}

/**
 * Safe console logger
 */
class SafeConsole {
  constructor() {
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    };
  }
  
  log(...args) {
    this.originalConsole.log(...processArgs(args));
  }
  
  error(...args) {
    this.originalConsole.error(...processArgs(args));
  }
  
  warn(...args) {
    this.originalConsole.warn(...processArgs(args));
  }
  
  info(...args) {
    this.originalConsole.info(...processArgs(args));
  }
  
  debug(...args) {
    this.originalConsole.debug(...processArgs(args));
  }
  
  /**
   * Install safe console globally
   */
  install() {
    console.log = this.log.bind(this);
    console.error = this.error.bind(this);
    console.warn = this.warn.bind(this);
    console.info = this.info.bind(this);
    console.debug = this.debug.bind(this);
  }
  
  /**
   * Restore original console
   */
  restore() {
    Object.assign(console, this.originalConsole);
  }
}

// Create and export instance
const safeConsole = new SafeConsole();

// Auto-install in production or when NODE_ENV is not development
if (process.env.NODE_ENV !== 'development') {
  safeConsole.install();
}

module.exports = {
  safeConsole,
  cleanText,
  install: () => safeConsole.install(),
  restore: () => safeConsole.restore()
};