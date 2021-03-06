/**
 * Util for page related functionality.
 */

/**
 * Render the given title via the given i18n object into a string and set it on the document.
 *
 * @param title
 * @param i18n
 * @param document
 */
export function renderTitle (title, i18n, document) {
  document.title = i18n.t(title)
}

/**
 * Updates the page title from the given route by updating the given store.
 *
 * @param route
 * @param store
 */
export function updateTitleFromRoute (route, store) {
  let title
  if (route.meta && route.meta.title) {
    title = route.meta.title
  } else {
    title = 'page.default.title'
  }
  store.dispatch('page/setTitle', title)
}

/**
 * Scrolls to the top of the element.
 *
 * @param el - The element to scroll in.
 */
export function scrollToTop (el) {
  el.scrollTop = 0
}

/**
 * Scrolls to the bottom of the element.
 *
 * @param el - The element to scroll in.
 */
export function scrollToBottom (el) {
  el.scrollTop = el.scrollHeight
}
