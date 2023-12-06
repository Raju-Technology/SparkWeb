import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { db, collection, addDoc, getDocs } from './config';

const App = () => {
  const [webcamRef, setWebcamRef] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [recognizedPlayer, setRecognizedPlayer] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
      ]);

      setModelLoaded(true);
    };

    loadModels();
  }, []);

  const recognizeFace = async () => {
    if (!modelLoaded) {
      console.error('Models not loaded yet.');
      return;
    }

    const video = webcamRef?.video;

    if (!video || !(video instanceof HTMLVideoElement)) {
      console.error('Invalid media type. Expected HTMLVideoElement.');
      return;
    }

    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions();

    if (detections.length > 0) {
      const faceDescriptor = Array.from(detections[0].descriptor); // Convert to array

      // Check if the face exists in the Firestore database
      const querySnapshot = await getDocs(collection(db, 'Players'));

      let recognizedPlayer = null;

      querySnapshot.forEach((doc) => {
        const { name, notes, faceDescriptor: storedFaceDescriptor } = doc.data();

        // Check if storedFaceDescriptor is a valid array
        if (storedFaceDescriptor && storedFaceDescriptor.length) {
          const distance = faceapi.euclideanDistance(faceDescriptor, storedFaceDescriptor);

          if (distance < 0.6) {
            console.log('Player recognized:', doc.data());
            recognizedPlayer = { name, notes };
          }
        }
      });

      if (!recognizedPlayer) {
        // If face not found, add the new face
        const playerName = 'New Person';
        const playerNotes = 'No Notes added';

        await addDoc(collection(db, 'Players'), {
          faceDescriptor,
          name: playerName,
          notes: playerNotes,
        });

        console.log('New player added to the Players collection.');
      }

      setRecognizedPlayer(recognizedPlayer);
    } else {
      console.log('No face detected.');
      setRecognizedPlayer(null); // Reset recognized player state
    }
  };

  return (
    <div>
      <h1>Scan Page</h1>
      {modelLoaded ? <Webcam ref={(ref) => setWebcamRef(ref)} /> : 'Loading models...'}
      <div>
        <button onClick={recognizeFace}>Capture and Identify</button>
        {recognizedPlayer && (
          <div>
            <h2>Player Recognized:</h2>
            <p>Name: {recognizedPlayer.name}</p>
            <p>Notes: {recognizedPlayer.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
