import { Component } from '@angular/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [InputComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  form = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
  });
}
