import { html, LitElement } from 'lit';
import { getDatabase, ref, onValue, set, get, child, push, update, connectDatabaseEmulator, query, orderByChild, orderByKey, equalTo } from "firebase/database";
import { ref as sRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export class FirebaseCrud extends LitElement {
  static get properties() {
    return {
      id: { type: String },
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
    this.id = `firebase-crud${Math.floor(Math.random() * 1000000)}`;
    this.emulation = false;
    this.showLog = false;
    this.firebaseApp = null;
    this.db = null;
    this.userData = null;
    this.storage = null;

    document.addEventListener('firebase-signin', this._firebaseLogin.bind(this));
    document.addEventListener('firebase-signout', this._firebaseLogout.bind(this));
  }

  _wcReady() {
    const componentCreatedEvent = new CustomEvent('wc-ready', {
      detail: {
        id: this.id,
        componentName: this.tagName,
        component: this,
      },
    });
    document.dispatchEvent(componentCreatedEvent);
  }

  update() {
    if (this.firebaseApp === null) {
      document.dispatchEvent(new CustomEvent('are-it-logged-into-firebase', {
        detail: {
          id: this.referenceId,
        }
      }));
    }
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
      this.storage = event.detail.firebaseStorage;
      this.consoleLog('_firebaseLogin', this.firebaseApp, this.db, this.userData, this.storage);
      this._wcReady();
    }
  }

  _firebaseLogout() {
    this.firebaseApp = null;
    this.db = null;
    this.userData = null;
    this.storage = null;
  }

  consoleLog(...args) {
    if (this.showLog) {
      console.log(...args);
    }
  }

  consoleError(...args) {
    if (this.showLog) {
      console.error(...args);
    }
  }

  listenData(path = '/', callbackExists, callbackNotExists = () => {}) {
    this.consoleLog('listenData', path);
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
    this.consoleLog('deleteData', path);
    const dbRef = ref(this.db);
    return new Promise((resolve, reject) => {
      set(child(dbRef, path), null).then(() => {
        callbackTrue(path);
        resolve(`${path} borrado de la base de datos`);
      }).catch((error) => {
        this.consoleError('Error deleting data:', error);
        reject(error);
      });
    });
  }

  insertData(data = {default: 'default data'}, path = '/', callbackTrue = () =>{}) {
    this.consoleLog('insertData', data, path);
    return new Promise((resolve, reject) => {
      set(ref(this.db, path), data).then(() => {
        callbackTrue(data);
        resolve(true);
      })
      .catch((error) => {
        this.consoleError(error);
        reject(error);
      });
    });
  }

  updateData(data = {default: 'default data'}, path = '/', callbackTrue = () =>{}) {
    return new Promise((resolve, reject) => {
      update(ref(this.db, path), data).then(() => {
        callbackTrue(data);
        resolve(`Actualización correcta en la base de datos`);
      })
      .catch((error) => {
        this.consoleError(error);
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
        this.consoleError(error);
        reject(error);
      });
    });
  }

  getDataFilterBy(path = '/', key, value, callbackTrue = () =>{}) {
    const dbRef = ref(this.db, path);
    return new Promise((resolve, reject) => {
      get(query(dbRef, orderByChild(key), equalTo(value))).then((snapshot) => {
        if (snapshot.exists()) {
          callbackTrue(snapshot.val());
          resolve(snapshot.val());
        } else {
          console.warn(`No hay datos para ${key} = ${value}`);
          resolve(null);
        }
      }).catch((error) => {
        this.consoleError(error);
        reject(error);
      });
    });
  }

  searchValue(path = '/', value, callbackTrue = () =>{}) {
    const dbRef = ref(this.db, path);
    return new Promise((resolve, reject) => {
      get(query(dbRef, orderByKey(), equalTo(value))).then((snapshot) => {
        if (snapshot.exists()) {
          callbackTrue(snapshot.val());
          resolve(snapshot.val());
        } else {
          console.warn(`No hay datos para ${key} = ${value}`);
          resolve(null);
        }
      }).catch((error) => {
        this.consoleError(error);
        reject(error);
      });
    });
  }

  getNewId(path = '/') {
    const newResultKey = push(child(ref(this.db), path)).key;
    return newResultKey;
  }

  /** SAVE FILES IN STORAGE */
  uploadFSFile(blob, pathAndFileName) {
    return new Promise((resolve, reject) => {
      const storageRef = sRef(this.storage, pathAndFileName);
      const uploadTask = uploadBytesResumable(storageRef, blob);
      uploadTask.on('state_changed', (snapshot) => {
        const process = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.consoleLog(`Upload is ${  process  }% done`);
        document.dispatchEvent(new CustomEvent('firebase-upload-progress', {
          detail: {
            id: this.referenceId,
            process,
          },
        }));
      }, (error) => {
        this.consoleError(error);
        reject(error);
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          this.consoleLog('File available at', downloadURL);
          resolve(downloadURL);
        });
      });
    });
  }

  /** DOWNLOAD FILES FROM STORAGE */
  downloadFSFile(path) {
    return new Promise((resolve, reject) => {
      sRef(this.storage, path).getDownloadURL().then((url) => {
        this.consoleLog('File available at', url);
        resolve(url);
      }).catch((error) => {
        this.consoleError(error);
        reject(error);
      });
    });
  }

  /** EMPTY RENDER */
  render() {
    return html``;
  }
}
