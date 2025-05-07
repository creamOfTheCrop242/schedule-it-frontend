import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = (route, state) => {
  console.log(localStorage.getItem('isLoggedIn'));
  if (localStorage.getItem('isLoggedIn') === 'false') {
    return true;
  }
  return false;
};
