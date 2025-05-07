export enum RxResourceStatuses {
  Idle = 'Idle', // The resource has no valid request and will not perform any loading.
  Error = 'Error', // Loading failed with an error.
  Loading = 'Loading', // The resource is currently loading a new value due to a change in its request.
  Reloading = 'Reloading', // The resource is reloading a fresh value for the same request.
  Resolved = 'Resolved', // Loading has completed, and the resource holds the value returned from the loader.
  Local = 'Local', // The resource's value was set locally via .set() or .update().
}

export interface LoginRequest {
  email: string;
  password: string;
}
