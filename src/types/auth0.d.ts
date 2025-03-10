import "@auth0/auth0-react";

declare module "@auth0/auth0-react" {
  interface RedirectLoginOptions {
    screen_hint?: string;
  }

  interface LogoutOptions {
    returnTo?: string;
  }

  interface AppState {
    returnTo?: string;
  }
}
