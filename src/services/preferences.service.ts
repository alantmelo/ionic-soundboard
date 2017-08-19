import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';


@Injectable()
export class PreferencesService {
  _preferences: object = {};
  _ready: Promise<any>;

  constructor(private storage: Storage) {
    /* When storage is ready, load all favourites into the app */
    this._ready = new Promise((resolve, reject) => {
      this.storage.ready()
      .then(() => {
        this.storage.forEach((value: any, key: string) => {
          if (key.startsWith('preferences:')) {
            const newKey = key.replace('preferences:', '');
            this.getPreferences()[newKey] = value;
          }
        })
        .then(() => this.setDefaultsIfNotAlready())
        .then(() => resolve())
        .catch(error => reject(error));
      })
      .catch(error => reject(error));
    });
  }

  ready(): Promise<any> {
    return this._ready;
  }

  /* Edit defaults here */
  setDefaultsIfNotAlready(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setIfNotAlready('baseUrl', 'http://kalis.me')
      .then(() => this.setIfNotAlready('soundsFile', '/sounds.json'))
      .then(() => this.setIfNotAlready('cachingEnabled', true))
      .catch(error => reject(error));
    });
  }

  resetToDefaults(): Promise<any> {
    return new Promise((resolve, reject) => {
      Object.keys(this.getPreferences()).forEach(key => {
        this.remove(key)
        .then(() => {
          if (Object.keys(this.getPreferences()).length === 0) {
            return this.setDefaultsIfNotAlready()
            .then(() => {
              resolve();
            })
            .catch(error => reject(error));
          }
        })
        .catch(error => reject(error));
      });
    });
  }

  exists(key: string): boolean {
    return this.getPreferences().hasOwnProperty(key);
  }

  set(key: string, value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.set('preferences:' + key, value)
      .then(() => {
        this.getPreferences()[key] = value;
        resolve(key);
      })
      .catch(error => reject(error));
    });
  }

  setIfNotAlready(key: string, value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.exists(key)) {
        resolve();
      }
      return this.set(key, value);
    });
  }

  remove(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.exists(key)) {
        reject();
      }
      this.storage.remove('preferences:' + key)
      .then(() => {
        this.getPreferences[key] = undefined;
        resolve();
      })
      .catch(error => reject(error));
    });
  }

  get(key: string): any {
    if (!this.exists(key)) {
      return undefined;
    }
    return this.getPreferences()[key];
  }

  /* Returns all favourites */
  getPreferences() {
    return this._preferences;
  }
}