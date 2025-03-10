import "@auth0/auth0-react";

declare module "@auth0/auth0-react" {
  interface RedirectLoginOptions<TAppState = any> {
    screen_hint?: string;
  }

  interface LogoutOptions {
    returnTo?: string;
  }
}
