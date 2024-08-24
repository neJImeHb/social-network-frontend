import React, { Component } from 'react'

import { FaSadTear } from "react-icons/fa";

export default class NotFound extends Component {
  render() {
    return (
      <div style={{display: 'flex', justifyContent: 'center', width: '100%', opacity: '0.8'}}>
        <title>Page is not found :(</title>
        <FaSadTear style={{height: '50px', width: '50px', marginTop: '15px', marginRight: '20px'}}/>
        <h1>PAGE IS NOT FOUND...</h1>
      </div>
    )
  }
}
