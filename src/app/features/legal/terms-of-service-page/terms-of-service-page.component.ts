import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-terms-of-service-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './terms-of-service-page.component.html',
  styleUrl: './terms-of-service-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsOfServicePageComponent {
  readonly authService = inject(AuthService);
}
