import React from 'react'
import cloud from '../images/cloud.png';

const ImageInput = ({setModalImageInput, setGetSelectedImg, setSelectedImageFromInput}) => {
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setSelectedImageFromInput(URL.createObjectURL(file));
        setGetSelectedImg(file); // Передача файла вместо строки
        setModalImageInput(false);
    };

    return (
        <div>
            <div className="modal">
                <div className="modal-content" style={{ width: '500px' }}>
                    <div className="file-upload">
                        <img src={cloud} alt="upload" style={{ width: '50px', height: '50px' }} />
                        <h3>Click box to upload</h3>
                        <p>The image will be compressed to <span style={{ textDecoration: 'underline' }}>500 x 600</span> pixels</p>
                        <input type="file" onChange={handleImageUpload} />
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <button className='floating-button' onClick={() => setModalImageInput(false)}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export {ImageInput}