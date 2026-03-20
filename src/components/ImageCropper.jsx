import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';

/**
 * ImageCropper Component
 * Allows users to crop and adjust their profile picture
 */
function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const previewCanvasRef = useRef(null);

  const onCropChangeHandler = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChangeHandler = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    updatePreview(imageSrc, croppedAreaPixels);
  }, [imageSrc]);

  // Update live preview of the cropped area
  const updatePreview = (imageSrc, pixelCrop) => {
    if (!previewCanvasRef.current || !pixelCrop) return;

    const image = new Image();
    image.onload = () => {
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = 120;
      canvas.height = 120;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        120,
        120
      );
    };
    image.src = imageSrc;
  };

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels) {
      alert('Please adjust the image');
      return;
    }

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      className="image-cropper-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="image-cropper-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h2 className="cropper-title">Adjust Your Profile Picture</h2>
        
        <div className="cropper-container">
          <div className="crop-preview-circular">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={true}
              onCropChange={onCropChangeHandler}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={onZoomChangeHandler}
              restrictPosition={true}
              minZoom={1}
              maxZoom={3}
            />
          </div>
        </div>

        <div className="cropper-controls">
          <div className="zoom-control">
            <label>Zoom:</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="zoom-slider"
            />
            <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          </div>
        </div>

        {/* Live Preview of Cropped Result */}
        <div className="cropper-preview-section">
          <div className="preview-label">Preview</div>
          <div className="cropper-preview-container">
            <canvas 
              ref={previewCanvasRef}
              className="cropper-preview-canvas"
            />
          </div>
        </div>

        <div className="cropper-buttons">
          <button
            className="cropper-btn cancel"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className="cropper-btn save"
            onClick={handleSaveCrop}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Save & Upload'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Helper function to get cropped image as base64
 * Generates the exact circular crop from the preview
 */
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      // Create canvas with the cropped dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to the cropped area size
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      // Draw the image portion onto the canvas
      // Source: crop region from original image
      // Destination: entire canvas (0, 0, width, height)
      ctx.drawImage(
        image,
        pixelCrop.x,           // Source X (where to start cropping)
        pixelCrop.y,           // Source Y (where to start cropping)
        pixelCrop.width,       // Source width
        pixelCrop.height,      // Source height
        0,                     // Destination X (start at 0)
        0,                     // Destination Y (start at 0)
        pixelCrop.width,       // Destination width (fill canvas)
        pixelCrop.height       // Destination height (fill canvas)
      );

      // Convert to base64 with high quality
      const data = canvas.toDataURL('image/jpeg', 0.95);
      resolve(data);
    };
    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}

export default ImageCropper;
