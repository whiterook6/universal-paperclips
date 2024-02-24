import { Component } from "preact";
import { printNumberWithCommas, printBigIntWithWords } from "./format";

interface IProps {
    currentFrameTimeMS: number;
    deltaTimeMS: number;
    ageMS: number;
    isRunning: boolean;
    isNewSecond: boolean;
}

interface IState {
    wire: number;
    incompleteClip: number;
    incompleteAutoClippers: number;
    clipsMade: bigint;
    clipsSold: bigint;
    autoClippers: number;
    funds: number;
    costPerClip: number;
    clipsPerSecond: Array<{time: number, clips: bigint}>;
}

export class Game extends Component<IProps, IState>{
    public state: IState = {
        incompleteClip: 0,
        incompleteAutoClippers: 0,
        wire: 1000,
        clipsMade: 0n,
        clipsSold: 0n,
        autoClippers: 10,
        funds: 0,
        costPerClip: 0.05,
        clipsPerSecond: []
    };

    public getClipsPerSecond = () => {
        if (this.state.clipsPerSecond.length < 2) {
            return 0;
        }
        const left = this.state.clipsPerSecond[0];
        const right = this.state.clipsPerSecond[this.state.clipsPerSecond.length - 1];
        const delay = right.time - left.time;
        if (delay < 1){
            return 0;
        }

        const difference = right.clips - left.clips;
        if (difference < Number.MAX_SAFE_INTEGER){
            return BigInt(Math.round(Number(difference) / delay * 1000));
        } else {
            return difference / BigInt(delay * 1000);
        }
    }

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

    public clip = () => {
        this.setState((oldState): Partial<IState> => {
            return {
                clipsMade: oldState.clipsMade + 1n
            };
        });
    }

    public canSellClips = () => {
        const { clipsMade, clipsSold } = this.state;
        const clipsLeft = clipsMade - clipsSold;
        return clipsLeft > 500n;
    }

    public sellClips = () => {
        if (!this.canSellClips()) {
            return;
        }

        this.setState((oldState): Partial<IState> => {
            return {
                clipsSold: oldState.clipsSold + 500n,
                funds: oldState.funds + this.state.costPerClip * 500
            };
        });
    }

    public componentDidUpdate(previousProps: Readonly<IProps>): void {
        const {
            currentFrameTimeMS,
            deltaTimeMS,
            isRunning
        } = this.props;
        if (Math.abs(currentFrameTimeMS - previousProps.currentFrameTimeMS) < 0.1) { // if we're rerendering with the same time, don't update
            return;
        } else if (!isRunning){ // if we're paused, definitely don't update
            return;
        }

        this.update(deltaTimeMS);
    }

    public update = (deltaTimeMS: number) => {
        this.setState((oldState: IState): Partial<IState> => {
            const newState: Partial<IState> = {};
            const newIncompleteClips = oldState.incompleteClip + oldState.autoClippers * (deltaTimeMS / 1000);
            if (newIncompleteClips > 1) {
                newState.clipsMade = oldState.clipsMade + BigInt(Math.floor(newIncompleteClips));
                newState.incompleteClip = newIncompleteClips % 1;

                // calculate updated clipsPerSecond
                const cutoff = this.props.ageMS - 2000;
                const newClipsPerSecond = oldState.clipsPerSecond.filter((cps) => cps.time > cutoff);
                newClipsPerSecond.push({time: this.props.ageMS, clips: newState.clipsMade});
                newState.clipsPerSecond = newClipsPerSecond;
            } else {
                newState.incompleteClip = newIncompleteClips;
            }

            return newState;
        });
    }

    public render = () => {
        const {
            clipsMade,
            clipsSold,
            autoClippers,
            funds,
        } = this.state;
        const newAutoClipperCost = this.nextAutoClipperCost();

        return (
            <div>
                <h1>Clips: {printNumberWithCommas(clipsMade - clipsSold)}</h1>
                <div>Clips made: {clipsMade} | Clips sold: {clipsSold}</div>
                <h2>Clips per second: {printNumberWithCommas(this.getClipsPerSecond())}</h2>
                <button onClick={this.clip}>Build Clip</button>
                <hr />
                <h3>Funds: ${funds.toFixed(2)}</h3>
                <button disabled={!this.canSellClips()} onClick={this.sellClips}>
                    Sell 500 clips for ${(this.state.costPerClip * 500).toFixed(2)}
                </button>
                <h3>Autoclippers: {printNumberWithCommas(autoClippers)}</h3>
                <button disabled={!this.canBuyAutoClipper()} onClick={this.buyAutoClipper}>
                    Buy AutoClipper (${newAutoClipperCost.toFixed(2)})
                </button>
            </div>
        )
    }

    private nextAutoClipperCost = () => {
        return Math.pow(1.05, this.state.autoClippers) * 5;
    }
}