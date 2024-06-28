# Promptpay QR Code Parser Web App

This is a simple web application that allows users to upload or drag-and-drop a QR code image, decode it, and display the parsed Promptpay details in a table.

## Features

- Drag and drop QR code image upload
- Display decoded QR code text
- Extract and display Promptpay details
- User-friendly interface with highlighted drag-and-drop area

## Installation

1. Clone the repository or download the source code.
2. Open the project directory.

## Usage

1. Open the `index.html` file in your web browser.

### Steps to Use:

1. **Upload a QR Code Image**: Click on the file input to select an image or drag and drop the image into the highlighted area.
2. **View Decoded Text**: The decoded text from the QR code will be displayed under "Decoded QR Code Text".
3. **View Promptpay Details**: The extracted PPInfo details will be displayed in a table format under "PPInfo Details".

## Project Structure


- **index.html**: The main HTML file that includes the structure of the web app.
- **script.js**: JavaScript file that handles file input, QR code decoding, and data extraction.
- **styles.css**: CSS file that styles the web app and drag-and-drop area.

## Dependencies

- **jsQR**: A pure JavaScript QR code reading library used for decoding QR codes.


![Screenshot](screenshot.png)

## License

This project is licensed under the MIT License.
