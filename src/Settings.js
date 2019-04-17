import React, { Component } from 'react';

class Settings extends Component {
    constructor() {
        super();
        this.state = {hide: false}
        this.hideToggle = this.hideToggle.bind(this);
    }
    render() {
        if(this.state.hide) {
            return(null);
        } else {
        return (
            <div id="options" style={{ width: '800px', margin: '0 auto' }}>
                <div id="gridsize">
                    <h1>Grid Size</h1>
                    <select>
                        <option>3x3</option>
                        <option>5x5</option>
                        <option>7x7</option>
                    </select>
                </div>
                <div id="ai">
                    <h1>AI</h1>
                    <select>
                        <option>Enabled</option>
                        <option>Disabled</option>
                    </select>
                </div>
                <button id="startbtn" onClick={this.hideToggle}>Start</button>
            </div>
        );
        }
    }

    hideToggle() {
        this.setState({hide:!this.state.hide});
    }
}

export default Settings;