import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { google } from 'google-maps';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { LocationsDBService } from '../core/locations-db.service';
import { GoogleMaps, GoogleMapsEvent, Marker, GoogleMapOptions, Environment, GoogleMap } from '@ionic-native/google-maps';
import { ILocation } from '../share/interfaces';

// tasaki parace ser que con natvie no dibuja y habría que tuil¡zar la api 3
//( https://stackoverflow.com/questions/5959788/google-maps-api-v3-how-show-the-direction-from-a-point-a-to-point-b-blue-line)
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

  auxLocationsList: ILocation[] = [];
  waypoints: any[] = [];
  bounds: any = null;
  response: any;

  constructor(
    private router: Router,
    public geolocation: Geolocation,
    private locationsdbService: LocationsDBService
  ) { }

  ngOnInit() {

    this.map = new google.maps.Map(document.getElementById('map_canvas'), {
      zoom: 15,
    });

    // Get actual position
    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
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
          this.lat = data[data.length - 1].lat
          this.lng = data[data.length - 1].lng

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

    let start = new google.maps.LatLng(this.startAddr.lat, this.startAddr.lng);
    let end = new google.maps.LatLng(this.endAddr.lat, this.endAddr.lng);

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
        this.map = new google.maps.Map(document.getElementById('map_canvas'), {
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
        // if (google.maps.geometry.spherical.computeDistanceBetween(start, stepPolyline.getPath().getAt(0)) > 1) {
        //   // add "dotted line"
        //   var extraLine1 = new google.maps.Polyline(walkingPolylineOptions2);
        //   extraLine1.setPath([stepPolyline.getPath().getAt(stepPolyline.getPath().getLength() - 1), end]);
        //   extraLine1.setMap(this.map);
        // }
        // if (google.maps.geometry.spherical.computeDistanceBetween(end, stepPolyline.getPath().getAt(stepPolyline.getPath().getLength() - 1)) > 1) {
        //   // add "dotted line"
        //   var extraLine2 = new google.maps.Polyline(walkingPolylineOptions2);
        //   extraLine2.setPath([stepPolyline.getPath().getAt(stepPolyline.getPath().getLength() - 1), end]);
        //   extraLine2.setMap(this.map);
        // }
        this.map.fitBounds(bounds);



      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });

  }

  goHome() {
    this.router.navigate(['/home']);
  }



  renderDirectionsPolylines(response, start, end) {
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
    var walkingPolylineOptions2 = {
      strokeColor: '#C83939',
      strokeOpacity: 0,
      strokeWeight: 4,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#808080',
          fillOpacity: 1,
          scale: 2,
          strokeColor: '#808080',
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
    if (google.maps.geometry.spherical.computeDistanceBetween(start, stepPolyline.getPath().getAt(0)) > 1) {
      // add "dotted line"
      var extraLine1 = new google.maps.Polyline(walkingPolylineOptions2);
      extraLine1.setPath([stepPolyline.getPath().getAt(stepPolyline.getPath().getLength() - 1), end]);
      extraLine1.setMap(this.map);
    }
    if (google.maps.geometry.spherical.computeDistanceBetween(end, stepPolyline.getPath().getAt(stepPolyline.getPath().getLength() - 1)) > 1) {
      // add "dotted line"
      var extraLine2 = new google.maps.Polyline(walkingPolylineOptions2);
      extraLine2.setPath([stepPolyline.getPath().getAt(stepPolyline.getPath().getLength() - 1), end]);
      extraLine2.setMap(this.map);
    }
    this.map.fitBounds(bounds);
  }

}
