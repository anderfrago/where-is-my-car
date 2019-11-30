import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationsDBService } from '../core/locations-db.service';
import { ILocation } from '../share/interfaces';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
})
export class SetupPage implements OnInit {
  auxLocationsList: ILocation[];
  constructor(private router:Router, private locationsdbService: LocationsDBService) { }

  ngOnInit() {
    this.locationsdbService.getAll().then(
      (data:ILocation[]) => {
        this.auxLocationsList = data;
      }
    );
  }

  goHome(){
    this.router.navigate(['/home']);
  }

  gotoPath(id){
    this.router.navigate(['/path', {'id': id}]);
  }

}
