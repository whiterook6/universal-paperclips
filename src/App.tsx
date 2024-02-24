import { Component } from "preact";
import { Game } from "./Game";
import { printMillisecondsAsClock } from "./format";

interface IState {
    /** The current time in milliseconds according to the browser */
    currentFrameTimeMS: DOMHighResTimeStamp;

    /** Is this the first frame since starting or resuming from pause? */
    isFirstFrame: boolean;

    /** Is the game currently running (not paused)? */
    isRunning: boolean;

    /** When was the previous frame */
    previousFrameTimeMS: DOMHighResTimeStamp;

    /** When did the game start, after accounting for pause time? */
    startTimeExcludingPausesMS: number;
};

export class App extends Component<any, IState> {
    private requestFrameID: number = 0;

    public state: IState = {
        currentFrameTimeMS: 0,
        isFirstFrame: true,
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
                isFirstFrame: true,
                isRunning: true
            } as IState;
        }, () => {
            this.requestFrameID = requestAnimationFrame(this.loop)
        });
    }
    
    public render() {
        const {
            currentFrameTimeMS,
            previousFrameTimeMS
        } = this.state;

        // how long has the game been running, excluding pauses, in milliseconds
        const ageMS = currentFrameTimeMS - this.state.startTimeExcludingPausesMS;
        const oldAgeMS = previousFrameTimeMS - this.state.startTimeExcludingPausesMS;
        const isNewSecond = Math.floor(ageMS / 1000) > Math.floor(oldAgeMS / 1000);

        // how old is this frame, in milliseconds
        const deltaTimeMS = currentFrameTimeMS - this.state.previousFrameTimeMS;

        // is the game unpaused
        const isRunning = this.state.isRunning;

        return (
            <div>
                <Game
                    ageMS={ageMS}
                    currentFrameTimeMS={currentFrameTimeMS}
                    isNewSecond={isNewSecond}
                    deltaTimeMS={deltaTimeMS}
                    isRunning={isRunning}
                />
                {this.state.isRunning ? <button onClick={this.pause}>Pause</button> : <button onClick={this.unPause}>Unpause</button>}
                <div>{printMillisecondsAsClock(ageMS)} of play time</div>
                {isNewSecond && <div>New second!</div>}
            </div>
        )
    }

    private loop = (currentFrameTimeMS: DOMHighResTimeStamp) => {
        if (!this.state.isRunning){
            return;
        }
        
        this.setState((oldState): Partial<IState> => {
            if (oldState.isFirstFrame){

                // Since we don't know how long it's been paused, we need to march the various timestamps forward
                const oldAge = oldState.currentFrameTimeMS - oldState.startTimeExcludingPausesMS;
                const previousFrameTimeMS = currentFrameTimeMS - 16.67; // guess the current framerate is 60fps

                return {
                    currentFrameTimeMS,
                    isFirstFrame: false,
                    previousFrameTimeMS: previousFrameTimeMS,
                    startTimeExcludingPausesMS: currentFrameTimeMS - oldAge,
                };
            } else {
                return {
                    currentFrameTimeMS: currentFrameTimeMS,
                    previousFrameTimeMS: oldState.currentFrameTimeMS,
                }
            }
        });

        this.requestFrameID = requestAnimationFrame(this.loop);
    }
}