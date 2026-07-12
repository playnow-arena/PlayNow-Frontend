import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

const PERMISSION_ASKED_KEY = 'playnow_fcm_permission_asked';
const FCM_TOKEN_KEY = 'playnow_fcm_token';
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let firebaseApp;
let messagingInstance;
let supportPromise;
let foregroundUnsubscribe;

const hasFirebaseConfig = () => (
  Boolean(firebaseConfig.apiKey)
  && Boolean(firebaseConfig.projectId)
  && Boolean(firebaseConfig.messagingSenderId)
  && Boolean(firebaseConfig.appId)
  && Boolean(vapidKey)
);

const getPermissionState = () => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

const getAskedState = () => localStorage.getItem(PERMISSION_ASKED_KEY) === 'true';

const getStoredFcmToken = () => localStorage.getItem(FCM_TOKEN_KEY) || '';

const setStoredFcmToken = (token) => {
  if (token) {
    localStorage.setItem(FCM_TOKEN_KEY, token);
    window.dispatchEvent(new CustomEvent('playnow:fcm-token', { detail: { token } }));
  }
};

const saveFcmTokenToBackend = async (token) => {
  const authToken = localStorage.getItem('playnow_token');
  if (!authToken || !token) return { saved: false, reason: 'missing-auth-or-token' };

  const res = await fetch(`${API_BASE_URL}/api/notifications/fcm-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Unable to save FCM token');
  }

  return res.json();
};

const ensureFirebaseMessaging = async () => {
  if (!hasFirebaseConfig()) {
    return { supported: false, reason: 'missing-config' };
  }

  if (!supportPromise) {
    supportPromise = isSupported();
  }

  const supported = await supportPromise;
  if (!supported || !('serviceWorker' in navigator)) {
    return { supported: false, reason: 'unsupported-browser' };
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
  }

  if (!messagingInstance) {
    messagingInstance = getMessaging(firebaseApp);
  }

  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({
    type: 'PLAYNOW_FIREBASE_CONFIG',
    firebaseConfig,
  });

  return { supported: true, messaging: messagingInstance, registration };
};

const requestNotificationPermissionAndToken = async () => {
  const permission = getPermissionState();

  if (permission === 'unsupported') {
    return { permission, token: '', supported: false };
  }

  if (permission === 'denied') {
    localStorage.setItem(PERMISSION_ASKED_KEY, 'true');
    return { permission, token: '', supported: false };
  }

  if (permission === 'default') {
    if (getAskedState()) {
      return { permission, token: '', supported: true, alreadyAsked: true };
    }

    localStorage.setItem(PERMISSION_ASKED_KEY, 'true');
    const requestedPermission = await Notification.requestPermission();
    if (requestedPermission !== 'granted') {
      return { permission: requestedPermission, token: '', supported: requestedPermission !== 'denied' };
    }
  }

  const setup = await ensureFirebaseMessaging();
  if (!setup.supported) {
    return {
      permission: getPermissionState(),
      token: '',
      supported: false,
      reason: setup.reason,
    };
  }

  const token = await getToken(setup.messaging, {
    vapidKey,
    serviceWorkerRegistration: setup.registration,
  });
  setStoredFcmToken(token);
  await saveFcmTokenToBackend(token);

  return { permission: 'granted', token, supported: true };
};

const refreshFcmToken = async () => {
  if (getPermissionState() !== 'granted') {
    return { permission: getPermissionState(), token: getStoredFcmToken(), refreshed: false };
  }

  const setup = await ensureFirebaseMessaging();
  if (!setup.supported) {
    return { permission: getPermissionState(), token: getStoredFcmToken(), refreshed: false, reason: setup.reason };
  }

  const token = await getToken(setup.messaging, {
    vapidKey,
    serviceWorkerRegistration: setup.registration,
  });
  const previousToken = getStoredFcmToken();
  setStoredFcmToken(token);
  await saveFcmTokenToBackend(token);

  return { permission: 'granted', token, refreshed: token !== previousToken };
};

const subscribeToForegroundMessages = async (callback) => {
  const setup = await ensureFirebaseMessaging();
  if (!setup.supported) return () => {};

  foregroundUnsubscribe?.();
  foregroundUnsubscribe = onMessage(setup.messaging, callback);
  return foregroundUnsubscribe;
};

export {
  getAskedState,
  getPermissionState,
  getStoredFcmToken,
  hasFirebaseConfig,
  requestNotificationPermissionAndToken,
  refreshFcmToken,
  saveFcmTokenToBackend,
  subscribeToForegroundMessages,
};
