
import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
  loading = true; // El estado de carga se inicia en verdadero

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loading = true; // Inicia la barra de carga al empezar la navegación
      } else if (event instanceof NavigationEnd) {
        setTimeout(() => {
          this.loading = false; // Desactiva la barra de carga después de cargar
        }, 1000); // Puedes ajustar el tiempo según sea necesario
      }
    });
  }
}