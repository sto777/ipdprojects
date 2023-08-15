
const _uploadImageInput = document.getElementById('upload-image-input');
const previewButton = document.getElementById('preview-button');
const removeButton = document.getElementById('remove-button');
const canvasElement = document.getElementById('canvas');
const ctx = canvasElement.getContext('2d');
let image;

function displayImagePreview() {
  const file = _uploadImageInput.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();

    img.onload = function () {
      // Resize the canvas to fit the image
      canvasElement.width = img.width;
      canvasElement.height = img.height;

      // Clear the canvas and draw the image
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      ctx.drawImage(img, 0, 0);
    };

    img.src = event.target.result;
    image = img;
  };

  reader.readAsDataURL(file);
}

function removeImagePreview() {
  // Reset the input value and clear the canvas
  _uploadImageInput.value = '';
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  image = null;
}

previewButton.addEventListener('click', displayImagePreview);
removeButton.addEventListener('click', removeImagePreview);
