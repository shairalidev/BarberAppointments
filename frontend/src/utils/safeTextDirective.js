/**
 * Vue Directive for Emoji Safety
 * Usage: v-safe-text or v-safe-text.replace
 */

import { safeText } from './emojiFilter.js';

export default {
  name: 'safe-text',
  
  mounted(el, binding) {
    updateElement(el, binding);
  },
  
  updated(el, binding) {
    updateElement(el, binding);
  }
};

function updateElement(el, binding) {
  const replace = binding.modifiers.replace || binding.arg === 'replace';
  const originalText = el.textContent || el.innerText || '';
  
  if (originalText) {
    const safeContent = safeText(originalText, replace);
    
    // Only update if content changed to avoid unnecessary DOM updates
    if (safeContent !== originalText) {
      el.textContent = safeContent;
      
      // Add data attribute to track that this element has been processed
      el.setAttribute('data-emoji-safe', 'true');
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Emoji directive: "${originalText}" -> "${safeContent}"`);
      }
    }
  }
}