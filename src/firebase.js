import firebase from "firebase";

const firebaseConfig = {
    apiKey: "AIzaSyAGTdCP76kUqejWYtScB9D_BrYgcMQgxPs",
    authDomain: "bros-ec418.firebaseapp.com",
    projectId: "bros-ec418",
    storageBucket: "bros-ec418.appspot.com",
    messagingSenderId: "228553027000",
    appId: "1:228553027000:web:25c882406e30575a07f34d"
}

const firebaseApp = firebase.initializeApp
(firebaseConfig);

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebaseApp.storage();
const provider = new
firebase.auth.GoogleAuthProvider();

export { db, auth, provider, storage };