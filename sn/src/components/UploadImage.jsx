import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import '../css/file.css';
import cloud from '../images/cloud.png';

// Utility function to create an image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

// Utility function to crop the image
const getCroppedImg = async (imageSrc, crop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    // Set the canvas size to the desired output size (200x300)
    const outputWidth = 500;
    const outputHeight = 600;
    canvas.width = outputWidth;
    canvas.height = outputHeight;
  
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
  
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      outputWidth,
      outputHeight
    );
  
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

const UploadImage = ({setIsUpload, ProfileAvatar}) => {
    const [selectedName, setSelectedName] = useState("");
    const [previewURL, setPreviewURL] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedArea, setCroppedArea] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedName(file.name);
            setPreviewURL(URL.createObjectURL(file));
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedArea(croppedAreaPixels);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!croppedArea || !previewURL) return;

        // Get the cropped image blob
        const croppedImage = await getCroppedImg(previewURL, croppedArea);

        const formData = new FormData();
        formData.append('image', croppedImage, `${selectedName}_cropped.jpg`);

        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch('http://localhost:8000/api/upload_avatar/', {
                method: 'POST',
                body: formData,
                headers: {'Authorization': `Bearer ${token}`},
            });

            if (response.ok) {
                console.log('Image uploaded successfully');
            } else {
                console.error('Upload failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }

        setIsUpload(false)
        ProfileAvatar()
    };

    return (
        <div>
            <div className="modal">
                <div className="modal-content" style={{ width: '500px' }}>
                    <div className="file-upload">
                        <img src={cloud} alt="upload" style={{ width: '50px', height: '50px' }} />
                        <h3> {selectedName || "Click box to upload"}</h3>
                        <p>The image will be compressed to <span style={{textDecoration: 'underline'}}>500 x 600</span> pixels</p>
                        <input type="file" onChange={handleFileChange} />
                        {previewURL && (
                            <div style={{ position: 'relative', width: '100%', height: 200 }}>
                                <Cropper
                                    image={previewURL}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={500 / 600}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                            </div>
                        )}
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <button className='floating-button' onClick={() => setIsUpload(false)}>Cancel</button>
                        <button className='floating-button' style={{ marginLeft: '200px' }} onClick={handleSubmit}>Continue</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { UploadImage };
