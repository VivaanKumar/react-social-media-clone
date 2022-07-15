import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyB_CTrYlVnQWISLQb-yZQyKw4nAGTV_YL0",
  authDomain: "disarray-e645a.firebaseapp.com",
  projectId: "disarray-e645a",
  storageBucket: "disarray-e645a.appspot.com",
  messagingSenderId: "569039143587",
  appId: "1:569039143587:web:ff59ae31192e6005d6b516",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebaseApp.storage();
const provider = new firebase.auth.GoogleAuthProvider();

export { db, auth, provider, storage };
