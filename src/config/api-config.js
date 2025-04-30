// Configuration des endpoints API en fonction de l'environnement

/**
 * Détermine si l'application s'exécute sur Netlify
 * @returns {boolean} True si l'application s'exécute sur Netlify
 */
export const isRunningOnNetlify = () => {
  return window.location.hostname.includes('netlify.app') || 
         process.env.NETLIFY === 'true';
};

/**
 * Détermine si l'application s'exécute sur Vercel
 * @returns {boolean} True si l'application s'exécute sur Vercel
 */
export const isRunningOnVercel = () => {
  return window.location.hostname.includes('vercel.app') || 
         process.env.VERCEL === '1';
};

/**
 * Retourne le préfixe API approprié en fonction de l'environnement
 * @returns {string} Le préfixe API
 */
export const getApiPrefix = () => {
  if (isRunningOnNetlify()) {
    return '/.netlify/functions/server';
  } else if (isRunningOnVercel()) {
    return '/api';
  } else {
    // Environnement de développement local
    return '/api';
  }
};

/**
 * Construit l'URL complète pour un endpoint API
 * @param {string} endpoint - L'endpoint API sans le préfixe
 * @returns {string} L'URL complète de l'endpoint API
 */
export const getApiUrl = (endpoint) => {
  const prefix = getApiPrefix();
  // S'assurer que l'endpoint ne commence pas par un slash si le préfixe se termine par un slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${prefix}/${formattedEndpoint}`;
};

// Endpoints API courants
export const API_ENDPOINTS = {
  UPLOAD: getApiUrl('upload'),
  UPDATE_TAGS: getApiUrl('update-tags'),
  STATUS: getApiUrl('status')
};

export default API_ENDPOINTS;