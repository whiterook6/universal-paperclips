import { Component } from "preact";
import { Game } from "./Game";

interface IState {
    firstFrame: boolean;
    previousFrameTimeMS: DOMHighResTimeStamp;
    currentFrameTimeMS: DOMHighResTimeStamp;
    isRunning: boolean;
};

export class App extends Component {
    private requestFrameID: number = 0;

    public state: IState = {
        firstFrame: true,
        previousFrameTimeMS: 0,
        currentFrameTimeMS: 0,
        isRunning: true
    };

    public componentDidMount(): void {
        this.unPause();
    }

    public componentWillUnmount(): void {
        if (this.requestFrameID) {
            cancelAnimationFrame(this.requestFrameID);
        }
    }

    public pause = () => {
        if (this.state.isRunning) {
            this.setState((oldState) => ({
                ...oldState,
                isRunning: false
            }));
        }
    }

    public unPause = () => {
        this.setState((oldState) => {
            return {
                ...oldState,
                previousFrameTimeMS: 0,
                currentFrameTimeMS: 0,
                firstFrame: true,
                isRunning: true
            } as IState;
        }, () => {
            this.requestFrameID = requestAnimationFrame(this.loop)
        });
    }
    
    public render() {
        return (
            <div>
                <Game
                    isRunning={this.state.isRunning}
                    currentFrameTimeMS={this.state.currentFrameTimeMS}
                    previousFrameTimeMS={this.state.previousFrameTimeMS}
                />
                {this.state.isRunning ? <button onClick={this.pause}>Pause</button> : <button onClick={this.unPause}>Unpause</button>}
            </div>
        )
    }

    private loop = (frameTime: DOMHighResTimeStamp) => {
        if (this.state.isRunning) {
            if (this.state.firstFrame){
                this.setState({
                    firstFrame: false,
                    previousFrameTimeMS: frameTime - 16.67,
                    currentFrameTimeMS: frameTime
                });
            } else {
                this.setState((oldState: IState): Partial<IState> => ({
                    previousFrameTimeMS: oldState.currentFrameTimeMS,
                    currentFrameTimeMS: frameTime
                }));
            }

            this.requestFrameID = requestAnimationFrame(this.loop);
        }
    }
}