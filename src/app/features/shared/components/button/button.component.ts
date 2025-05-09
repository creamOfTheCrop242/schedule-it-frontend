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
  type = input<'button' | 'link'>('button');
  background = input<string>();
  color = input<string>('white');
  bgOptions = {
    purple: 'cotc-bg-purple',
    white: 'bg-white',
  };
  colorOptions = {
    black: 'text-black',
    white: 'text-white',
  };
}
