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
    clips: bigint;
    autoClippers: number;
    funds: number;
    costPerClip: number;
}

export class Game extends Component<IProps, IState>{
    public state: IState = {
        incompleteClip: 0,
        incompleteAutoClippers: 0,
        wire: 1000,
        clips: 0n,
        autoClippers: 10,
        funds: 0,
        costPerClip: 0.05,
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

    public clip = () => {
        this.setState((oldState) => {
            return {
                ...oldState,
                clips: oldState.clips + 1n
            };
        });
    }

    public canSellClips = () => {
        return this.state.clips > 500n;
    }

    public sellClips = () => {
        if (!this.canSellClips()) {
            return;
        }

        this.setState((oldState) => {
            return {
                ...oldState,
                clips: oldState.clips - 500n,
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
                newState.clips = oldState.clips + BigInt(Math.floor(newIncompleteClips));
                newState.incompleteClip = newIncompleteClips % 1;
            } else {
                newState.incompleteClip = newIncompleteClips;
            }

            return newState;
        });
    }

    public render = () => {
        const {
            clips,
            autoClippers,
            funds,
        } = this.state;
        const newAutoClipperCost = this.nextAutoClipperCost();

        return (
            <div>
                <h1>Clips: {printNumberWithCommas(clips)}</h1>
                <h2>Clips per second: 0</h2>
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
                {this.props.isNewSecond ? <div>new second</div> : null}
            </div>
        )
    }

    private nextAutoClipperCost = () => {
        return Math.pow(1.05, this.state.autoClippers) * 5;
    }
}