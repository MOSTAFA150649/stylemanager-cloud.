const hostname = (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : 'localhost';
const port = (hostname === 'localhost' || hostname.startsWith('192.168.')) ? ':5000' : '';
const protocol = (typeof window !== 'undefined') ? window.location.protocol : 'http:';
const API_BASE_URL = `${protocol}//${hostname}${port}/api`;

export default API_BASE_URL;

