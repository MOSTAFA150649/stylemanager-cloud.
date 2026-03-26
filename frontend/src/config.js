const hostname = (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : 'localhost';
const API_BASE_URL = `http://${hostname}:5000/api`;
export default API_BASE_URL;
