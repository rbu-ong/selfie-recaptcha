// src/CameraCapture.js
import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { FaSquare, FaCircle, FaPlay } from "react-icons/fa";
import * as faceapi from "face-api.js"; // Import face-api.js

// Define possible shapes with corresponding icons
const shapes = [
  { name: "triangle", icon: <FaPlay /> },
  { name: "square", icon: <FaSquare /> },
  { name: "circle", icon: <FaCircle /> },
];

// Function to generate watermarks for the grid
const generateWatermarks = (rows, cols) => {
  const totalCells = rows * cols;
  const watermarkedCells = new Array(totalCells).fill(null);

  // Randomly select 12 indices to be watermarked
  const indices = new Set();
  while (indices.size < 12) {
    indices.add(Math.floor(Math.random() * totalCells));
  }

  // Assign random shapes to the selected indices
  indices.forEach((index) => {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    watermarkedCells[index] = randomShape;
  });

  return watermarkedCells;
};

const CameraCapture = () => {
  const webcamRef = useRef(null);
  const [squarePos, setSquarePos] = useState({ top: "20%", left: "30%" });
  const [capturedImage, setCapturedImage] = useState(null);
  const [watermarks, setWatermarks] = useState([]);
  const [selectedShape, setSelectedShape] = useState(shapes[0]); // Default shape to select
  const [userSelections, setUserSelections] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const intervalRef = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    };
    loadModels();
  }, []);

  // Retake picture and reset the fields
  const retakeCapture = () => {
    setCapturedImage(null);
    intervalRef.current = setInterval(randomizeSquarePosition, 1000);
    setValidationResult(null);
  };

  // Function to randomize the position of the square
  const randomizeSquarePosition = () => {
    const top = Math.floor(Math.random() * 40) + 10; // Between 20% and 60%
    const left = Math.floor(Math.random() * 40) + 10; // Between 30% and 70%

    setSquarePos({ top: `${top}%`, left: `${left}%` });
  };

  // Set interval to randomize square position every second
  useEffect(() => {
    intervalRef.current = setInterval(randomizeSquarePosition, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Function to capture the photo from the webcam
  const capturePhoto = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const img = new Image();
    img.src = imageSrc;
    img.onload = async () => {
      const detections = await faceapi.detectAllFaces(img);
      if (detections.length > 0) {
        setCapturedImage(imageSrc); // Save the captured image
        setWatermarks(generateWatermarks(5, 5)); // Generate a 5x5 grid of watermarks
        setSelectedShape(shapes[Math.floor(Math.random() * shapes.length)]); // Randomize shape selection
        setUserSelections(new Array(25).fill(false)); // Initialize user selections
        setValidationResult(null); // Reset validation result
        clearInterval(intervalRef.current); // Stop random square movement
      } else {
        alert("No face detected. Please take a valid selfie.");
      }
    };
  };

  // Function to handle user selections
  const handleSelection = (index) => {
    const updatedSelections = [...userSelections];
    updatedSelections[index] = !updatedSelections[index]; // Toggle selection
    setUserSelections(updatedSelections);
  };

  // Function to validate the user's selections
  const handleValidation = () => {
    let passed = true;

    for (let i = 0; i < watermarks.length; i++) {
      if (userSelections[i]) {
        if (!watermarks[i] || watermarks[i].name !== selectedShape.name) {
          passed = false;
          break;
        }
      } else {
        if (watermarks[i] && watermarks[i].name === selectedShape.name) {
          passed = false;
          break;
        }
      }
    }

    if (passed) {
      setValidationResult("Passed");
    } else {
      setValidationResult("Failed");
    }
  };

  // Display validation result screen if validation is done
  if (validationResult) {
    return (
      <div>
        <h2>Validation Result</h2>
        <p>{validationResult}</p>
        <button
          onClick={() => {
            retakeCapture();
          }}
        >
          Retake Photo
        </button>
      </div>
    );
  }

  // Display the captured image and grid if image is captured
  if (capturedImage) {
    return (
      <div>
        <h2>
          Select{" "}
          {selectedShape.name.charAt(0).toUpperCase() +
            selectedShape.name.slice(1)}
          s
        </h2>
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={capturedImage}
            alt="Captured"
            style={{ width: "100%", maxWidth: "500px" }}
          />
          <div
            style={{
              position: "absolute",
              top: squarePos.top,
              left: squarePos.left,
              width: "30%",
              height: "30%",
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gridTemplateRows: "repeat(5, 1fr)",
              gap: "1px",
            }}
          >
            {watermarks.map((shape, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: userSelections[index]
                    ? "red"
                    : "rgba(255, 255, 255, 0.7)",
                  fontSize: "12px",
                  cursor: shape ? "pointer" : "default",
                  backgroundColor: userSelections[index]
                    ? "rgba(255, 0, 0, 0.3)"
                    : shape
                    ? "rgba(255, 255, 255, 0.1)"
                    : "transparent",
                }}
                onClick={() => shape && handleSelection(index)}
              >
                {shape ? shape.icon : null}
              </div>
            ))}
          </div>
        </div>
        <div>
          <button onClick={handleValidation}>Validate</button>
          <button
            onClick={() => {
              retakeCapture();
            }}
          >
            Retake Photo
          </button>
        </div>
      </div>
    );
  }

  // Initial screen with webcam feed and "Continue" button
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width="100%"
        height="auto"
      />
      <div
        style={{
          position: "absolute",
          border: "2px solid red",
          width: "30%",
          height: "30%",
          ...squarePos,
        }}
      ></div>
      <button
        onClick={capturePhoto}
        style={{ display: "block", margin: "20px auto" }}
      >
        Continue
      </button>
    </div>
  );
};

export default CameraCapture;
