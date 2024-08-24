import React from 'react';

const MoreInformation = ({setMoreInfo, bio}) => {
  return (
    <div>
        <div className="modal">
            <div className="modal-content" style={{maxWidth: '800px', minWidth: '500px'}}>
                <div style={{display: 'flex'}}>
                    <h4 style={{textAlign: 'center', marginTop: '0px'}}>Biography:</h4>
                    <pre style={{marginLeft: '10px', marginTop: '0px', whiteSpace: 'pre-wrap'}}>{bio.biography}</pre>
                </div>
                <button className='floating-button' style={{float: 'right'}} onClick={() => setMoreInfo(false)}>Close</button>
            </div>
        </div>
    </div>
  );
};

export { MoreInformation };
