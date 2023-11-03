import * as firebase from "firebase";

var firebaseConfig = {
  apiKey: "AIzaSyC57Pd1maQ5O2QyCCdJOqLDvhqmjYzgwBE",
  authDomain: "nftverse-f7113.firebaseapp.com",
  databaseURL: "https://nftverse-f7113-default-rtdb.firebaseio.com",
  projectId: "nftverse-f7113",
  storageBucket: "nftverse-f7113.appspot.com",
  messagingSenderId: "402334473820",
  appId: "1:402334473820:web:fbccfa1383a2fee5d8d099",
  };
  // Initialize Firebase
  var fireDb = firebase.initializeApp(firebaseConfig);

  export default fireDb.database().ref();