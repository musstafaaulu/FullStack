import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar'; // NAVBAR'I BURAYA EKLEDİK

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent], // NAVBAR'I BURAYA DA EKLEDİK
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'eticaret-frontend';
}