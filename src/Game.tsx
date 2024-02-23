import { Component } from "preact";

interface IProps {
    currentFrameTimeMS: number;
    previousFrameTimeMS: number;
    isRunning: boolean;
}

interface IState {
    wire: number;
    incompleteClip: number;
    clips: bigint;
    autoClippers: number;
    funds: number;
}

export class Game extends Component<IProps, IState>{
    public state: IState = {
        incompleteClip: 0,
        wire: 1000,
        clips: 0n,
        autoClippers: 1,
        funds: 0
    };

    public canBuyAutoClipper = () => {
        return this.state.funds >= this.nextAutoClipperCost();
    }

    public buyAutoClipper = () => {
        if (!this.canBuyAutoClipper()) {
            return;
        }

        this.setState((oldState) => {
            return {
                ...oldState,
                autoClippers: oldState.autoClippers + 1,
                funds: oldState.funds - this.nextAutoClipperCost()
            };
        });
    }

    public componentDidUpdate(previousProps: Readonly<IProps>): void {
        const {
            currentFrameTimeMS: currentTimeMS,
            previousFrameTimeMS: previousTimeMS,
            isRunning
        } = this.props;
        if (currentTimeMS !== previousProps.currentFrameTimeMS && isRunning) {
            this.update(currentTimeMS - previousTimeMS);
        }
    }

    public update = (deltaTimeMS: number) => {
        this.setState(oldState => {
            const newState = {
                ...oldState
            };
            const newIncompleteClips = oldState.incompleteClip + oldState.autoClippers * (deltaTimeMS / 1000);
            newState.clips = oldState.clips + BigInt(Math.floor(newIncompleteClips));
            newState.incompleteClip = newIncompleteClips % 1;
            console.log(newState.clips.toString(10));

            return newState;
        })
    }

    public render = () => {
        const {
            clips,
            autoClippers,
            funds
        } = this.state;
        const newAutoClipperCost = this.nextAutoClipperCost();

        return (
            <div>
                <h1>Clips: {clips.toString(10)}</h1>
                <h2>Clips per second: {autoClippers}</h2>
                <hr />
                <h3>Funds: {funds}</h3>
                <h3>Autoclippers: {autoClippers}</h3>
                <button disabled={!this.canBuyAutoClipper()} onClick={this.buyAutoClipper}>
                    Buy AutoClipper (${newAutoClipperCost})
                </button>
            </div>
        )
    }

    private nextAutoClipperCost = () => {
        return 0; // Math.pow(1.1, this.state.autoClippers) * 5;
    }
}