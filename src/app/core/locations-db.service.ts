import { Injectable } from '@angular/core';
import { ILocation } from '../share/interfaces';
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class LocationsDBService {

  auxLocation: ILocation;
  auxLocationsList: ILocation[] = [];

  constructor(
    private storage: Storage) { }

  // Stores a value
  setItem(reference: string, value: ILocation) {
    this.storage.set(reference, { id: value.id, lat: value.lat, lng: value.lng })
      .then(
        data => console.log('Stored first item!', data),
        error => console.error('Error storing item', error)
      );
  }

  // Gets a stored item
  getItem(reference): Promise<ILocation> {
    return this.storage.get(reference);
  }


  // check if it is empty
  empty() {
    return this.storage.keys()
      .then(
        data => { return true },
        error => { return false }
      );
  }
  // Retrieving all keys
  keys(): Promise<string[]> {
    return this.storage.keys();
  }

  // Retrieving all values
  // getAll(): Promise<ILocation[]> {
  //   return this.storage.keys().then((k) => {
  //     k.forEach(element => {
  //       this.getItem(element).then(
  //         data => {
  //           this.auxLocationsList.push(data)
  //         }
  //       );

  //     });
  //     return this.auxLocationsList;
  //   });
  // }

  // getAll(): Promise<ILocation[]> {

  //   return new Promise((resolve, reject) => {
  //     this.storage.keys().then((k) => {
  //       let all = [];
        
  //       k.forEach(element => {
  //         this.getItem(element).then(
  //           data => {
  //             all.push(data)
  //           }
  //         );
  //       });
        
  //       resolve(all);
  //     });
  //   });

  // }
  getAll() {
    var promise = new Promise((resolve, reject) => {
      this.storage.forEach((value, key, index) => {
        this.auxLocationsList.push(value);
      }).then((d) => {
        resolve(this.auxLocationsList);
      });
    });
    return promise;
}


// Removes a single stored item
remove(reference: string) {
  this.storage.remove(reference)
    .then(
      data => console.log(data),
      error => console.error(error)
    );
}

// Removes all stored values.
clear() {
  this.storage.clear()
    .then(
      data => console.log(data),
      error => console.error(error)
    );
}

}
