/**
 * Emoji Safe i18n Plugin
 * Automatically filters emojis from translation messages
 */

import { safeText } from './emojiFilter.js';

export default {
  install(app, options = {}) {
    const { replace = true, debug = false } = options;
    
    // Override the global $t function to filter emojis
    const originalT = app.config.globalProperties.$t;
    
    if (originalT) {
      app.config.globalProperties.$t = function(key, ...args) {
        try {
          const result = originalT.call(this, key, ...args);
          
          if (typeof result === 'string') {
            const filtered = safeText(result, replace);
            
            if (debug && result !== filtered) {
              console.log(`Emoji filtered: "${result}" -> "${filtered}"`);
            }
            
            return filtered;
          }
          
          return result;
        } catch (error) {
          if (debug) {
            console.warn(`Translation error for key "${key}":`, error);
          }
          
          // Return safe fallback
          return safeText(String(key), replace);
        }
      };
    }
    
    // Add global emoji filter method
    app.config.globalProperties.$safeText = (text, shouldReplace = replace) => {
      return safeText(text, shouldReplace);
    };
    
    // Add global filter for templates
    app.config.globalProperties.$filters = {
      ...(app.config.globalProperties.$filters || {}),
      safeText: (text, shouldReplace = replace) => safeText(text, shouldReplace),
      removeEmojis: (text) => safeText(text, false),
      replaceEmojis: (text) => safeText(text, true)
    };
  }
};