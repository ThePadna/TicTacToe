import React from 'react';
class Options extends React.Component {

    constructor() {
        super();
    }
    render() {
        return (
            <div id="options">
                <div id="size">
                    <p>Size</p>
                    <input id="sizetoggle" type="checkbox"></input>
                </div>
                <div id="ai">
                    <p>AI</p>
                    <input id="aitoggle" type="checkbox"></input>
                </div>
            </div>
        )
    }
}
export default Options;