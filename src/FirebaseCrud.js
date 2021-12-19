import { html, LitElement } from 'lit';
import { getDatabase, ref, onValue, set, get, child, push, update, connectDatabaseEmulator } from "firebase/database";

export class FirebaseCrud extends LitElement {
  static get properties() {
    return {
      referenceId: { type: String, attribute: 'reference-id' },
      emulation: { type: Boolean, attribute: 'emulation', reflect: true },
      showLog: { type: Boolean, attribute: 'show-log', reflect: true,  },
    };
  }

  updated() {
    this.showLog = (this.showLog) ? true : this.emulation;
  }

  constructor() {
    super();
    this.emulation = false;
    this.showLog = false;
    this.firebaseApp = null;
    this.db = null;
    this.userData = null;

    document.addEventListener('firebase-signin', this._firebaseLogin.bind(this));
    document.addEventListener('firebase-signout', this._firebaseLogout.bind(this));
  }

  _firebaseLogin(event) {  
    const refId = event.detail.id;
    if (refId === this.referenceId) {
      this.firebaseApp = event.detail.firebaseApp;
      this.db = getDatabase(this.firebaseApp);
      this.userData = event.detail.user;
      if (this.emulation) {
        connectDatabaseEmulator(this.db);
      }
      this.consolelog('_firebaseLogin', this.firebaseApp, this.db, this.userData);
    }
  }

  _firebaseLogout() {
    this.firebaseApp = null;
    this.db = null;
    this.userData = null;
  }

  consolelog(...args) {
    if (this.showLog) {
      console.log(...args);
    }
  }

  consoleerror(...args) {
    if (this.showLog) {
      console.error(...args);
    }
  }

  database() {
    
  }

  listenData(path = '/', callbackExists, callbackNotExists = () => {}) {
    this.consolelog('listenData', path);
    if (callbackExists) {
      const refDb = ref(this.db, path);
      onValue(refDb, (snapshot) => {
        if (snapshot.exists()) {
          callbackExists(snapshot.val());
        } else {
          callbackNotExists();
        }
      });
    } else {
      throw new Error('callbackExists is required');
    }
  }

  deleteData(path = '/', callbackTrue = () =>{}) {
    this.consolelog('deleteData', path);
    const dbRef = ref(this.db);
    return new Promise((resolve, reject) => {
      set(child(dbRef, path), null).then(() => {
        callbackTrue();
        resolve(`${path} borrado de la base de datos`);
      }).catch((error) => {
        this.consoleerror('Error deleting data:', error);
        reject(error);
      });
    });
  }

  insertData(data = {default: 'default data'}, path = '/', callbackTrue = () =>{}) {
    this.consolelog('insertData', data, path);
    return new Promise((resolve, reject) => {
      set(ref(this.db, path), data).then(() => {
        callbackTrue();
        resolve(true);
      })
      .catch((error) => {
        this.consoleerror(error);
        reject(error);
      });
    });
  }

  updateData(data = {default: 'default data'}, path = '/', callbackTrue = () =>{}) {
    return new Promise((resolve, reject) => {
      update(ref(this.db, path), data).then(() => {
        callbackTrue();
        resolve(`Actualización correcta en la base de datos`);
      })
      .catch((error) => {
        this.consoleerror(error);
        reject(error);
      });
    });
  }

  getData(path = '/', callbackTrue = () =>{}) {
    const dbRef = ref(this.db);
    return new Promise((resolve, reject) => {
      get(child(dbRef, path)).then((snapshot) => {
        if (snapshot.exists()) {
          callbackTrue(snapshot.val());
          resolve(snapshot.val());
        } else {
          resolve(null);
        }
      }).catch((error) => {
        this.consoleerror(error);
        reject(error);
      });
    });
  }

  getNewId(path = '/') {
    const newResultKey = push(child(ref(this.db), path)).key;
    return newResultKey;
  }

  render() {
    return html``;
  }
}
