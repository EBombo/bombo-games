import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/analytics";
import "firebase/storage";
import "firebase/database";
import "firebase/auth";
import isEmpty from "lodash/isEmpty";

console.log("process.env.NODE_ENV", process.env.NODE_ENV);

const PORT = process.env.NEXT_PUBLIC_PORT ?? 5000;
console.log("process.env.NEXT_PUBLIC_PORT", PORT);

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? "localhost:3001";
console.log("process.env.NEXT_PUBLIC_DOMAIN", DOMAIN);

const CONFIG = process.env.NEXT_PUBLIC_CONFIG ?? "";
//console.log("process.env.NEXT_PUBLIC_CONFIG", CONFIG);

const version = "0.0.1";

const config = JSON.parse(CONFIG);

const hostName = typeof window === "undefined" ? DOMAIN : window.location.host;

if (DOMAIN?.includes("local") || DOMAIN?.includes("red") || DOMAIN?.includes("dev")) {
  console.log("dev", version);
} else {
  console.log("prod", version);
}

let firestore: firebase.firestore.Firestore;
let storage: firebase.storage.Storage;
let auth: firebase.auth.Auth;
let analytics: firebase.analytics.Analytics;
let database: firebase.database.Database;

let analyticsEvents: firebase.analytics.Analytics;
let firestoreEvents: firebase.firestore.Firestore;
let storageEvents: firebase.storage.Storage;
let authEvents: firebase.auth.Auth;

let analyticsBingo: firebase.analytics.Analytics;
let firestoreBingo: firebase.firestore.Firestore;
let storageBingo: firebase.storage.Storage;
let authBingo: firebase.auth.Auth;

let analyticsRoulette: firebase.analytics.Analytics;
let firestoreRoulette: firebase.firestore.Firestore;
let storageRoulette: firebase.storage.Storage;
let authRoulette: firebase.auth.Auth;

let analyticsTrivia: firebase.analytics.Analytics;
let firestoreTrivia: firebase.firestore.Firestore;
let storageTrivia: firebase.storage.Storage;
let authTrivia: firebase.auth.Auth;

let analyticsHanged: firebase.analytics.Analytics;
let firestoreHanged: firebase.firestore.Firestore;
let storageHanged: firebase.storage.Storage;
let authHanged: firebase.auth.Auth;

if (isEmpty(firebase.apps)) {
  try {
    console.log("initializeApp", isEmpty(firebase.apps));
    firebase.initializeApp(config.firebase);

    firestore = firebase.firestore();
    database = firebase.database();
    storage = firebase.storage();
    auth = firebase.auth();

    if (typeof window !== "undefined") analytics = firebase.analytics();

    firestore.settings({ ignoreUndefinedProperties: true });
  } catch (error) {
    console.error("error initializeApp", error);
  }
  // Allow connection with events firebase
  try {
    firebase.initializeApp(config.firebaseEvents, "events");
    firestoreEvents = firebase.app("events").firestore();
    storageEvents = firebase.app("events").storage();
    authEvents = firebase.app("events").auth();

    if (typeof window !== "undefined") {
      analyticsEvents = firebase.app("events").analytics();
    }

    firestoreEvents.settings({ ignoreUndefinedProperties: true });
  } catch (error) {
    console.error("error initializeApp", error);
  }
  //Allow connection with bingo firebase
  try {
    firebase.initializeApp(config.firebaseBingo, "bingo");
    firestoreBingo = firebase.app("bingo").firestore();
    storageBingo = firebase.app("bingo").storage();
    authBingo = firebase.app("bingo").auth();

    if (typeof window !== "undefined") {
      analyticsBingo = firebase.app("bingo").analytics();
    }

    firestoreBingo.settings({ ignoreUndefinedProperties: true });
  } catch (error) {
    console.error("error initializeApp", error);
  }
  //Allow connection with roulette firebase
  try {
    firebase.initializeApp(config.firebaseRoulette, "roulette");
    firestoreRoulette = firebase.app("roulette").firestore();
    storageRoulette = firebase.app("roulette").storage();
    authRoulette = firebase.app("roulette").auth();

    if (typeof window !== "undefined") {
      analyticsRoulette = firebase.app("roulette").analytics();
    }

    firestoreRoulette.settings({ ignoreUndefinedProperties: true });
  } catch (error) {
    console.error("error initializeApp", error);
  }
  //Allow connection with trivia firebase
  try {
    firebase.initializeApp(config.firebaseTrivia, "trivia");
    firestoreTrivia = firebase.app("trivia").firestore();
    storageTrivia = firebase.app("trivia").storage();
    authTrivia = firebase.app("trivia").auth();

    if (typeof window !== "undefined") {
      analyticsTrivia = firebase.app("trivia").analytics();
    }

    firestoreTrivia.settings({ ignoreUndefinedProperties: true });
  } catch (error) {
    console.error("error initializeApp", error);
  }

  //Allow connection with hanged firebase
  try {
    firebase.initializeApp(config.firebaseHanged, "hanged");
    firestoreHanged = firebase.app("hanged").firestore();
    storageHanged = firebase.app("hanged").storage();
    authHanged = firebase.app("hanged").auth();

    if (typeof window !== "undefined") {
      analyticsHanged = firebase.app("hanged").analytics();
    }

    firestoreHanged.settings({ ignoreUndefinedProperties: true });
  } catch (error) {
    console.error("error initializeApp", error);
  }
}

if (DOMAIN?.includes("localhost")) {
  //config.serverUrl = config.serverUrlLocal;
  //firestore.useEmulator("localhost", 8080);
  //auth.useEmulator("http://localhost:9099/");
}

export {
  analyticsHanged,
  firestoreHanged,
  storageHanged,
  authHanged,
  analyticsBingo,
  firestoreBingo,
  storageBingo,
  authBingo,
  analyticsTrivia,
  firestoreTrivia,
  storageTrivia,
  authTrivia,
  analyticsRoulette,
  firestoreRoulette,
  storageRoulette,
  authRoulette,
  analyticsEvents,
  firestoreEvents,
  storageEvents,
  authEvents,
  firestore,
  analytics,
  database,
  firebase,
  hostName,
  version,
  storage,
  config,
  auth,
};
