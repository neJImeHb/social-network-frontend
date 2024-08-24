import React from "react";

const ModalPost = () => {
    return (
        <div>
            <div className="modal">
                <div className="modal-content">
                    <h2 style={{textAlign: 'center', marginTop: '0px'}}>some text</h2>
                    <button className='floating-button'>Yes</button>
                    <button className='floating-button' style={{marginLeft: '200px'}}>No</button>
                </div>
            </div>
        </div>
      );
}

export {ModalPost}