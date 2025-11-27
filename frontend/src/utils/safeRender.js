/**
 * Safely converts any value to a string for React rendering
 * Prevents React error #31 (Objects are not valid as a React child)
 */
export const safeString = (value, fallback = '') => {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  // If it's already a string or number, return as string
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  
  // If it's a boolean, convert to string
  if (typeof value === 'boolean') {
    return String(value);
  }
  
  // If it's an object, try to extract a meaningful string value
  if (typeof value === 'object') {
    // If it's an array, return fallback (arrays can't be rendered directly)
    if (Array.isArray(value)) {
      return fallback;
    }
    
    // Try to get common ID fields
    if (value._id) {
      return String(value._id);
    }
    if (value.id) {
      return String(value.id);
    }
    if (value.batch_id) {
      return safeString(value.batch_id, fallback);
    }
    
    // If it has a toString method, use it
    if (typeof value.toString === 'function') {
      try {
        const str = value.toString();
        if (str !== '[object Object]') {
          return str;
        }
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Last resort: return fallback
    return fallback;
  }
  
  // For any other type, return fallback
  return fallback;
};

/**
 * Safely extracts an ID from an object or value
 */
export const safeId = (value, fallback = '') => {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  
  if (typeof value === 'object' && !Array.isArray(value)) {
    return String(value._id || value.id || value.batch_id || fallback);
  }
  
  return fallback;
};

/**
 * Safely processes an array to ensure all values are renderable
 */
export const safeArray = (arr, fallback = []) => {
  if (!Array.isArray(arr)) {
    return fallback;
  }
  
  return arr.filter(item => item !== null && item !== undefined);
};

