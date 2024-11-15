export function addThicknessSlider(app: HTMLElement) {
  // Create the slider
  const thicknessSlider = document.createElement("input");
  thicknessSlider.type = "range";
  thicknessSlider.min = "1"; // Minimum thickness
  thicknessSlider.max = "50"; // Maximum thickness (can adjust as needed)
  thicknessSlider.value = "10"; // Default value
  thicknessSlider.id = "thicknessSlider";

  // Label for slider
  const label = document.createElement("label");
  label.innerHTML = "<br>Line Thickness: ";
  label.appendChild(thicknessSlider);

  // Append slider and label to the DOM
  app.appendChild(label);
  return thicknessSlider;
}

export function createButton(
  innerHTML: string,
  parent: HTMLElement,
  onClick: () => void,
): HTMLButtonElement {
  // Create a new button element
  const button = document.createElement("button");

  // Set the button's inner HTML
  button.innerHTML = innerHTML;

  // Append the button to the specified parent
  parent.appendChild(button);

  // Attach the provided click event handler
  button.addEventListener("click", onClick);

  // Return the newly created button element
  return button;
}
