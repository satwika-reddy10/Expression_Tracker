import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { uploadImages } from '../services/api.js';  // Import your API function

const ImageCapture = () => {
    const [screenshot, setScreenshot] = useState(null);
    const [webcamImage, setWebcamImage] = useState(null);
    const videoRef = useRef(null);
    const [sessionId, setSessionId] = useState(null); // Session ID for the session folder

    // Function to capture a screenshot
    const captureScreenshot = async () => {
        const canvas = await html2canvas(document.body); // Capture the current view
        canvas.toBlob(blob => {
            const file = new File([blob], 'screenshot.png', { type: 'image/png' }); // Save as PNG
            setScreenshot(file);
        }, 'image/png');
    };

    // Function to capture webcam image
    const captureWebcamImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                const file = new File([blob], 'webcam.png', { type: 'image/png' }); // Save as PNG
                setWebcamImage(file);
            }, 'image/png');
        }
    };

    // Upload images every 4 seconds
    useEffect(() => {
        const intervalId = setInterval(() => {
            captureScreenshot();
            captureWebcamImage();
        }, 4000);

        return () => clearInterval(intervalId);
    }, []);

    // Upload images when both are ready
    useEffect(() => {
        const upload = async () => {
            if (screenshot && webcamImage && sessionId) {
                try {
                    await uploadImages(screenshot, webcamImage, sessionId);
                    console.log('Images uploaded successfully');
                } catch (error) {
                    console.error('Error uploading images:', error);
                }
            }
        };
        upload();
    }, [screenshot, webcamImage, sessionId]);

    // Start webcam and create session ID on component mount (session starts)
    useEffect(() => {
        const startWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                // Request server to create a new session and get the session ID
                const response = await fetch('http://localhost:5000/start-session');
                const data = await response.json();
                setSessionId(data.sessionId);
            } catch (error) {
                console.error('Error accessing webcam or creating session:', error);
            }
        };
        startWebcam();
    }, []);

    return (
        <div>
            <video ref={videoRef} autoPlay style={{ display: 'none' }} /> {/* Hidden video element */}
        </div>
    );
};

export default ImageCapture;
