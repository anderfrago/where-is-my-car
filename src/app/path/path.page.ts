import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { google } from 'google-maps';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationsDBService } from '../core/locations-db.service';
import { ILocation } from '../share/interfaces';

declare var google: any;

@Component({
  selector: 'app-path',
  templateUrl: './path.page.html',
  styleUrls: ['./path.page.scss'],
})
export class PathPage implements OnInit {

  map: any;
  lat: number;
  lng: number;
  directionsService: any = null;
  directionsDisplay: any = null;
  startAddr: ILocation;
  endAddr: ILocation

  subscription:any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public geolocation: Geolocation,
    private locationsdbService: LocationsDBService
  ) {  }
  ngOnInit() { 
    let id = this.route.snapshot.params.id;
    this.loadPath(id);
  }

  ionViewDidLeave() {
    this.subscription.unsubscribe(); // <<<<---- unsubscribe the subscription (not the observable!)
  }
  goHome() {
    this.router.navigate(['/home']);
  }


  loadPath(id?) {
    this.map = new google.maps.Map(document.getElementById('map_path'), {
      zoom: 15,
    });
    
    // Get actual position
    let watch = this.geolocation.watchPosition({ enableHighAccuracy : true, timeout: 5000 });
    this.subscription = watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      var today = new Date();
      let nextKey = today.toString();
      this.lat = data.coords.latitude
      this.lng = data.coords.longitude

      // Center the map to the actual position
      this.map.setCenter(new google.maps.LatLng(this.lat, this.lng));

      this.startAddr = {
        id: nextKey,
        lat: this.lat,
        lng: this.lng
      }
      let markerA = new google.maps.Marker({
        title: 'Tu',
        icon: 'assets/images/person.png',
        animation: 'DROP',
        map: this.map,
        position: {
          lat: this.lat,
          lng: this.lng
        }
      });

      let mapOptions = {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        camera: {
          target: {
            lat: data.coords.latitude,
            lng: data.coords.longitude
          },
          zoom: 18,
          tilt: 30
        }
      };


      // Get values from database

      this.locationsdbService.getAll().then(
        (data: ILocation[]) => {
          // data can be a set of coordinates, or an error (if an error occurred).
          var today = new Date();
          let nextKey = today.toString();
          // Check if we are comming from las location
          if(id === undefined)
          {
            this.lat = data[data.length - 1].lat
            this.lng = data[data.length - 1].lng
          }
          else{
            // or if comming from a selected location in setup page
            this.lat = data[id].lat
            this.lng = data[id].lng
          }


          this.endAddr = {
            id: nextKey,
            lat: this.lat,
            lng: this.lng
          }
          let markerB = new google.maps.Marker({
            title: 'Tu coche',
            icon: 'assets/images/car-marker.png',
            map: this.map,
            animation: 'DROP',
            position: {
              lat: this.lat,
              lng: this.lng
            }
          });
        }
      );       
    });

  }

  private calculateRoute() {
    this.directionsService = new google.maps.DirectionsService();

    this.directionsService.route({
      origin: new google.maps.LatLng(this.startAddr.lat, this.startAddr.lng),
      destination: new google.maps.LatLng(this.endAddr.lat, this.endAddr.lng),
      travelMode: google.maps.TravelMode.WALKING
    }, function (response, status) {
      this.directionsDisplay = new google.maps.DirectionsRenderer();
      this.directionsDisplay.setMap(this.map);
      this.directionsDisplay.setPanel(document.getElementById("directionsPanel"));

      if (status == google.maps.DirectionsStatus.OK) {
        this.directionsDisplay.setDirections(response);
        this.map = new google.maps.Map(document.getElementById('map_path'), {
          zoom: 15,
        });

        let polylineOptions = {
          strokeColor: '#C83939',
          strokeOpacity: 1,
          strokeWeight: 4
        };
        var walkingPolylineOptions = {
          strokeColor: '#C83939',
          strokeOpacity: 0,
          strokeWeight: 4,
          icons: [{
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#C83939',
              fillOpacity: 1,
              scale: 2,
              strokeColor: '#C83939',
              strokeOpacity: 1,
            },
            offset: '0',
            repeat: '10px'
          }]
        };

        var legs = response.routes[0].legs;
        var bounds = new google.maps.LatLngBounds();
        for (let i = 0; i < legs.length; i++) {
          var steps = legs[i].steps;
          for (let j = 0; j < steps.length; j++) {
            var nextSegment = steps[j].path;
            var stepPolyline = new google.maps.Polyline(polylineOptions);
            if (steps[j].travel_mode == google.maps.TravelMode.WALKING) {
              stepPolyline.setOptions(walkingPolylineOptions)
            }
            for (let k = 0; k < nextSegment.length; k++) {
              stepPolyline.getPath().push(nextSegment[k]);
              bounds.extend(nextSegment[k]);
            }
            stepPolyline.setMap(this.map);
          }
        }
        this.map.fitBounds(bounds);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });

  }
}
