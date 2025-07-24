import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request and add withCredentials: true
  const modifiedRequest = req.clone({
    withCredentials: true,
  });

  // Pass the modified request to the next handler
  return next(modifiedRequest);
};
