# CameraCapture Component

## Overview

The `CameraCapture` component is a React component that integrates webcam functionality and face detection using `face-api.js`. It captures a selfie, overlays a randomized grid of shapes, and validates user selections against a specific shape.

## Screenshots

Capture with no face detected.<br>
![Capture with no face detected.](gitimages/no-face-detected.jpg)

Capture with recaptcha randomize symbols.<br>
![Capture with recaptcha randomize symbols.](gitimages/recaptcha.jpg)

Validation result.<br>
![Validation result.](gitimages/validation-result.jpg)

## Features

- Captures an image from the webcam.
- Detects faces in the captured image using `face-api.js`.
- Overlays a grid with random shapes on the captured image.
- Allows users to select specific shapes in the grid.
- Validates the user's shape selections.

## Installation

### Prerequisites

Ensure you have `docker` installed and a camera available.

### Build the Docker Image

Open a terminal in the root directory of your project and run:

```bash
docker build -t selfie-recaptcha .
```

### Run the Docker Container

After the image is built, you can run it with:

```bash
docker run -p 80:80 selfie-recaptcha
```

### Access Your Application

Open a web browser and go to http://localhost. You should see your React application running.

## Component Breakdown

### Imports

- `react`, `useRef`, `useState`, `useEffect` from React.
- `Webcam` from `react-webcam` for webcam functionality.
- Icons (`FaSquare`, `FaCircle`, `FaPlay`) from `react-icons/fa`.
- `face-api.js` for face detection.

### State Variables

- `squarePos`: Position of the square overlay on the webcam feed.
- `capturedImage`: Stores the captured image data.
- `watermarks`: Array of watermarked cells.
- `selectedShape`: The shape to be validated.
- `userSelections`: Tracks user selections in the grid.
- `validationResult`: Result of the user's shape validation.
- `intervalRef`: Reference to the interval for randomizing square position.

### Functions

- `generateWatermarks(rows, cols)`: Generates a grid of watermarked cells with random shapes.
- `retakeCapture()`: Resets the state for retaking a photo.
- `randomizeSquarePosition()`: Randomizes the position of the square overlay.
- `capturePhoto()`: Captures a photo from the webcam and processes it for face detection.
- `handleSelection(index)`: Handles user selections in the grid.
- `handleValidation()`: Validates user selections against the required shape.

### Hooks

- `useEffect` to load face detection models on component mount.
- `useEffect` to set an interval for randomizing the square position.

### Conditional Rendering

- Displays the initial webcam feed and "Continue" button.
- Shows the captured image with a grid overlay if an image is captured.
- Shows the validation result screen if validation is completed.

## Running the Application

Start the development server:

```bash
npm start
```

Navigate to `http://localhost:3000` to see the `CameraCapture` component in action.
