export function scrollAncestorToEnd(element: HTMLElement) {
  let ancestor = element.parentElement
  while (ancestor && ancestor.scrollHeight <= ancestor.clientHeight)
    ancestor = ancestor.parentElement
  ancestor?.scrollTo({ top: ancestor.scrollHeight, behavior: 'smooth' })
}
