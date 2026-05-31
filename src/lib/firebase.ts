import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

// Defer auth/storage until first use on the client. Eager getAuth() during SSR/build
// with CI mock credentials can throw FirebaseError: auth/invalid-api-key.
function createLazySingleton<T>(factory: () => T): () => T {
  let instance: T | undefined;
  let initializing = false;

  return () => {
    if (instance !== undefined) {
      return instance;
    }
    if (initializing) {
      // Re-entrant access during first init (e.g. via auth proxy). Firebase
      // getAuth/getStorage are idempotent per app, but avoid duplicate assignment.
      return factory();
    }
    initializing = true;
    try {
      instance = factory();
      return instance;
    } finally {
      initializing = false;
    }
  };
}

const getFirebaseAuth = createLazySingleton(() => getAuth(app));
const getFirebaseStorage = createLazySingleton(() => getStorage(app));

function createLazyServiceProxy<T extends object>(getInstance: () => T): T {
  const boundMethods = new Map<PropertyKey, (...args: unknown[]) => unknown>();

  return new Proxy({} as T, {
    get(_target, prop) {
      const instance = getInstance();
      const value = Reflect.get(instance, prop, instance);

      if (typeof value !== "function") {
        return value;
      }

      let bound = boundMethods.get(prop);
      if (!bound) {
        bound = (value as (...args: unknown[]) => unknown).bind(instance);
        boundMethods.set(prop, bound);
      }
      return bound;
    },
    set(_target, prop, value) {
      return Reflect.set(getInstance(), prop, value);
    },
  });
}

// Backward-compatible exports: same lazy-init behavior as getFirebaseAuth/getFirebaseStorage.
// Property access (e.g. auth.currentUser, storage.ref()) triggers initialization, not import.
const auth = createLazyServiceProxy(getFirebaseAuth);
const storage = createLazyServiceProxy(getFirebaseStorage);

export { app, db, auth, storage, getFirebaseAuth, getFirebaseStorage };
