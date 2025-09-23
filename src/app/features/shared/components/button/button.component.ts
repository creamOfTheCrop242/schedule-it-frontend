import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-button',
  imports: [CommonModule, RouterModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  label = input<string>();
  link = input<string>();
  isInternal = input<boolean>();
  background = input<string>();
  color = input<string>('white');
  bgOptions = {
    purple: 'cotc-bg-purple',
    white: 'bg-white',
    clear: 'bg-transparent',
    red: 'bg-red-500',
  };
  colorOptions = {
    black: 'text-black',
    white: 'text-white',
  };

  navigateToLink() {
    window.location.href = this.link();
  }
}
