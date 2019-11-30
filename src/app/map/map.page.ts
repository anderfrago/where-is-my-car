import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GoogleMaps, GoogleMapsEvent, Marker, GoogleMapOptions,  GoogleMap } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationsDBService } from '../core/locations-db.service';
import { ILocation } from '../share/interfaces';


@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  map: GoogleMap;
  lat: number;
  lng: number;
  location: ILocation;
  subscription: any;

  constructor(route: ActivatedRoute, private router: Router, private geolocation: Geolocation, private locationsdbService: LocationsDBService) { 
  }

  ngOnInit() {
    let watch = this.geolocation.watchPosition({ enableHighAccuracy : true, timeout: 5000 });
    this.subscription = watch.subscribe((data) => {
      this.lat = data.coords.latitude;
      this.lng = data.coords.longitude;
      this.loadMap();
    });  
  }

  ionViewDidLeave() {
    this.subscription.unsubscribe(); // <<<<---- unsubscribe the subscription (not the observable!)
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  loadMap() {
      // data can be a set of coordinates, or an error (if an error occurred).
      let mapOptions: GoogleMapOptions = {
        camera: {
          target: {
            lat: this.lat,
            lng: this.lng
          },
          zoom: 18,
          tilt: 30
        }
      };
      this.map = GoogleMaps.create('map_canvas', mapOptions);

      let marker: Marker = this.map.addMarkerSync({
        title: 'Tu coche',
        icon: 'assets/images/car-marker.png',
        animation: 'DROP',
        position: {
          lat: this.lat,
          lng: this.lng
        }
      });

      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        alert('Posición del vehículo almacenada en base de datos');
        // Save the value in database
        var today = new Date();
        let nextKey = today.toString();
        let auxLocation: any = {
          id: nextKey,
          lat: this.lat,
          lng: this.lng
        }
        this.locationsdbService.setItem(nextKey, auxLocation);
      });
  }

}
