import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-log-card',
  imports: [ButtonComponent],
  templateUrl: './log-card.component.html',
  styleUrl: './log-card.component.scss',
})
export class LogCardComponent {}