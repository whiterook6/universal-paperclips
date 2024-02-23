import { Component } from "preact";
import { Game } from "./Game";
import { printMillisecondsAsClock } from "./format";

interface IState {
    currentFrameTimeMS: DOMHighResTimeStamp;
    firstFrame: boolean;
    isRunning: boolean;
    previousFrameTimeMS: DOMHighResTimeStamp;
    startTimeExcludingPausesMS: number;
};

export class App extends Component<any, IState> {
    private requestFrameID: number = 0;

    public state: IState = {
        currentFrameTimeMS: 0,
        firstFrame: true,
        isRunning: true,
        previousFrameTimeMS: 0,
        startTimeExcludingPausesMS: 0,
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
                firstFrame: true,
                isRunning: true
            } as IState;
        }, () => {
            this.requestFrameID = requestAnimationFrame(this.loop)
        });
    }
    
    public render() {
        const ageMS = this.state.currentFrameTimeMS - this.state.startTimeExcludingPausesMS;
        return (
            <div>
                <Game
                    isRunning={this.state.isRunning}
                    currentFrameTimeMS={this.state.currentFrameTimeMS}
                    previousFrameTimeMS={this.state.previousFrameTimeMS}
                />
                {this.state.isRunning ? <button onClick={this.pause}>Pause</button> : <button onClick={this.unPause}>Unpause</button>}
                <div>
                    {printMillisecondsAsClock(ageMS)} of play time
                </div>
            </div>
        )
    }

    private loop = (frameTime: DOMHighResTimeStamp) => {
        if (this.state.isRunning) {
            if (this.state.firstFrame){
                const oldAge = this.state.currentFrameTimeMS - this.state.startTimeExcludingPausesMS;
                this.setState({
                    startTimeExcludingPausesMS: frameTime - oldAge,
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