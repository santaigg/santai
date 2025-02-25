import { Window } from "happy-dom";

/**
 * Setup a browser-like environment for testing
 * This is similar to Jest's jsdom environment but uses happy-dom with Bun
 */

// Create a browser-like environment
const window = new Window({
  url: "http://localhost"
});

// Set up global browser objects
// @ts-ignore - Type definitions don't match exactly but this works at runtime
global.window = window;
// @ts-ignore
global.document = window.document;
// @ts-ignore
global.navigator = window.navigator;

// Add other browser globals that might be needed by tests
// @ts-ignore
global.HTMLElement = window.HTMLElement;
// @ts-ignore
global.HTMLDivElement = window.HTMLDivElement;
// @ts-ignore
global.Element = window.Element;
// @ts-ignore
global.Node = window.Node;
// @ts-ignore
global.Event = window.Event;

// Add fetch API if needed
if (!global.fetch) {
  // @ts-ignore
  global.fetch = window.fetch.bind(window);
}

// Add localStorage and sessionStorage
// @ts-ignore
global.localStorage = window.localStorage;
// @ts-ignore
global.sessionStorage = window.sessionStorage; 