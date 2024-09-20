import { Buffer } from 'buffer';

export function decryptToken(token) {
    try {
        const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
        const userData = JSON.parse(decodedToken)[0];
        return userData;
    } catch (error) {
        console.error("Invalid token format:", error);
        return null;
    }
}

export function getUserDataFromToken() {
    const token = localStorage.getItem('token');
    return token ? decryptToken(token) : null;
}
