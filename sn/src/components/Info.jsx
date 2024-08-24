import React from "react";

const Info = (props) => {
    return(
        <div className="info">
            <div style={{marginLeft: '10px', marginRight: '10px'}}>
                <p style={{paddingTop: '10px', paddingBottom: '10px'}}>{props.info || props.infoMessage}</p>
            </div>
        </div>
    )
}

export {Info}