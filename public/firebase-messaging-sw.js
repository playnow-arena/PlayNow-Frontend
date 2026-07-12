/*
 * Firebase Messaging Service Worker Compatibility
 * This file allows the Firebase JS SDK to find the service worker at the default location.
 * It imports the main service worker logic from sw.js.
 */
importScripts('/sw.js');
