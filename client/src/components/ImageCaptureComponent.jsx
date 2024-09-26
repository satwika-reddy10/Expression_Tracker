// src/components/ImageCaptureComponent.jsx
import React, { useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { uploadImages } from '../services/api';

const ImageCaptureComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (videoRef.current) {
          // Assign the stream to the video element
          videoRef.current.srcObject = stream;

          // Play the video only when it's ready (loadedmetadata event)
          videoRef.current.onloadedmetadata = () => {
            try {
              videoRef.current.play(); // Safely attempt to play the video
            } catch (err) {
              console.error('Error playing video:', err);
            }
          };
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };

    startWebcam();

    const captureImages = async () => {
      // Capture screenshot of the entire page
      const canvas = await html2canvas(document.body);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const screenshotFile = new File([blob], 'screenshot.png', { type: 'image/png' });

          // Capture webcam image using hidden canvas
          const canvasElement = canvasRef.current;
          const video = videoRef.current;

          if (video && canvasElement) {
            // Set canvas dimensions to match the video feed
            canvasElement.width = video.videoWidth;
            canvasElement.height = video.videoHeight;
            const ctx = canvasElement.getContext('2d');
            ctx.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

            canvasElement.toBlob(async (webcamBlob) => {
              if (webcamBlob) {
                const webcamFile = new File([webcamBlob], 'webcam.png', { type: 'image/png' });
                await uploadImages(screenshotFile, webcamFile);
              }
            }, 'image/png'); // Capture as PNG
          }
        }
      });
    };

    const intervalId = setInterval(captureImages, 3000);

    return () => {
      clearInterval(intervalId);
      // Stop webcam stream on component unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div>
      {/* Hidden Video Element */}
      <video ref={videoRef} style={{ display: 'none' }} />
      {/* Hidden Canvas Element */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {/* <h2>Image capture in progress...</h2> */}
    </div>
  );
};

export default ImageCaptureComponent;
