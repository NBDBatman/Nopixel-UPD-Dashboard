// Requires firebase-app-compat, firebase-auth-compat, firebase-database-compat CDN scripts
const _fbConfig={
  apiKey:"AIzaSyArW26RC1u80hbQTKICI0BO1UU332pyVD8",
  authDomain:"upd-dashboard-9fb3d.firebaseapp.com",
  databaseURL:"https://upd-dashboard-9fb3d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:"upd-dashboard-9fb3d",
  storageBucket:"upd-dashboard-9fb3d.firebasestorage.app",
  messagingSenderId:"691801766223",
  appId:"1:691801766223:web:6958dd506ca915cb12ed3a"
};
firebase.initializeApp(_fbConfig);
window._db=firebase.database();
window._auth=firebase.auth();
