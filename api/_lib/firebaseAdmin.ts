import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing server env var: ${name}`);
  }
  return value;
}

export function isAdminSdkConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}

export function isStorageEnabled(): boolean {
  return (
    isAdminSdkConfigured() &&
    Boolean(process.env.FIREBASE_STORAGE_BUCKET) &&
    process.env.FIREBASE_STORAGE_ENABLED === 'true'
  );
}

function getApp(): App {
  if (!isAdminSdkConfigured()) {
    throw new Error('Firebase Admin SDK is not configured.');
  }
  const existing = getApps()[0];
  if (existing) return existing;

  const privateKey = required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
  return initializeApp({
    credential: cert({
      projectId: required('FIREBASE_PROJECT_ID'),
      clientEmail: required('FIREBASE_CLIENT_EMAIL'),
      privateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
  });
}

export function adminDb() {
  return getFirestore(getApp());
}

export function adminAuth() {
  return getAuth(getApp());
}

export function adminBucket() {
  if (!isStorageEnabled()) {
    throw new Error('Firebase Storage is disabled on the server.');
  }
  return getStorage(getApp()).bucket();
}
