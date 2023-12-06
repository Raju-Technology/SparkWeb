import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs,getDoc, where,doc, query } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBU6baHnrBPXUIU3OUtrO_FlmHkXKRmMeE",
  authDomain: "technologygarage-coaching.firebaseapp.com",
  databaseURL: "https://technologygarage-coaching-default-rtdb.firebaseio.com",
  projectId: "technologygarage-coaching",
  storageBucket: "technologygarage-coaching.appspot.com",
  messagingSenderId: "72644873935",
  appId: "1:72644873935:web:01d2d14be347b41fae31ba",
  measurementId: "G-011D6EK701"
};

const app = initializeApp(firebaseConfig); 
const db = getFirestore(app);

export {db,collection,addDoc, getDocs,getDoc, where, doc,query}