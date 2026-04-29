import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-help-page',
  imports: [RouterLink],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPageComponent {
  readonly authService = inject(AuthService);
}
