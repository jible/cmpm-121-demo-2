export function addColorPicker(app: HTMLElement) {
  // Create the color picker input element
  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.id = "colorPicker";
  colorPicker.value = "#000000"; // Default color: black

  // Insert the color picker into the DOM
  app.appendChild(colorPicker);
  return colorPicker;
}

export function addThicknessSlider(app: HTMLElement) {
  // Create the slider
  const thicknessSlider = document.createElement("input");
  thicknessSlider.type = "range";
  thicknessSlider.min = "1"; // Minimum thickness
  thicknessSlider.max = "50"; // Maximum thickness (can adjust as needed)
  thicknessSlider.value = "1"; // Default value
  thicknessSlider.id = "thicknessSlider";

  // Label for slider
  const label = document.createElement("label");
  label.innerHTML = "Line Thickness: ";
  label.appendChild(thicknessSlider);

  // Append slider and label to the DOM
  app.appendChild(label);
  return thicknessSlider;
}

export function createButton(
  innerHTML: string,
  parent: HTMLElement,
  onClick: () => void
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