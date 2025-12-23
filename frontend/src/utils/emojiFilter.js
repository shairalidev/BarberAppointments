/**
 * Emoji Filter Utility
 * Removes emojis from text to prevent message compiler errors
 */

// Comprehensive emoji regex pattern
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]/gu;

/**
 * Remove emojis from text
 * @param {string} text - Text that may contain emojis
 * @returns {string} - Text with emojis removed
 */
export function removeEmojis(text) {
  if (typeof text !== 'string') {
    return text;
  }
  
  try {
    return text.replace(EMOJI_REGEX, '').trim();
  } catch (error) {
    console.warn('Emoji filter error:', error);
    return text; // Return original text if filtering fails
  }
}

/**
 * Replace emojis with text alternatives
 * @param {string} text - Text that may contain emojis
 * @returns {string} - Text with emojis replaced with text
 */
export function replaceEmojis(text) {
  if (typeof text !== 'string') {
    return text;
  }
  
  try {
    const emojiMap = {
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
    
    let result = text;
    
    // Replace known emojis with text alternatives
    Object.keys(emojiMap).forEach(emoji => {
      result = result.replace(new RegExp(emoji, 'g'), emojiMap[emoji]);
    });
    
    // Remove any remaining emojis
    result = result.replace(EMOJI_REGEX, '');
    
    return result.trim();
  } catch (error) {
    console.warn('Emoji replacement error:', error);
    return removeEmojis(text); // Fallback to simple removal
  }
}

/**
 * Safe text processor for i18n messages
 * @param {string} text - Text to process
 * @param {boolean} replace - Whether to replace emojis with text or remove them
 * @returns {string} - Processed text
 */
export function safeText(text, replace = false) {
  if (!text) return '';
  
  try {
    return replace ? replaceEmojis(text) : removeEmojis(text);
  } catch (error) {
    console.warn('Safe text processing error:', error);
    return String(text).replace(/[^\w\s\-.,!?()]/g, ''); // Ultra-safe fallback
  }
}

/**
 * Vue filter for templates
 * @param {string} value - Value to filter
 * @returns {string} - Filtered value
 */
export function emojiFilter(value) {
  return safeText(value, true);
}

export default {
  removeEmojis,
  replaceEmojis,
  safeText,
  emojiFilter
};