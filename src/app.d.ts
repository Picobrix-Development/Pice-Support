/// <reference types="@sveltejs/kit" />

declare global {
  namespace App {
    interface Locals {
      user?: {
        username: string;
        email: string;
        role: string;
      };
    }
    interface PageData {}
    interface Error {}
    interface Platform {}
  }
}

export {};