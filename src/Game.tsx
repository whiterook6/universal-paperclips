import { Component } from "preact";
import { printNumberWithCommas } from "./format";

interface IProps {
    currentFrameTimeMS: number;
    deltaTimeMS: number;
    ageMS: number;
    isRunning: boolean;
    isNewSecond: boolean;
}

interface IState {
    wire: number;
    incompleteClips: number;
    incompleteAutoClippers: number;
    clipsMade: bigint;
    clipsSold: bigint;
    autoClippers: number;
    funds: number;
    costPerClip: number;
    clipsMadeLastSecond: bigint;
    clipsPerSecond: bigint;
}

export class Game extends Component<IProps, IState>{
    public state: IState = {
        incompleteClips: 0,
        incompleteAutoClippers: 0,
        wire: 1000,
        clipsMade: 0n,
        clipsSold: 0n,
        autoClippers: 5,
        funds: 0,
        costPerClip: 0.05,
        clipsMadeLastSecond: 0n,
        clipsPerSecond: 0n
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

    public canClip = () => {
        return this.state.wire > 0;
    }

    public clip = () => {
        if (!this.canClip()) {
            return;
        }
        this.setState((oldState): Partial<IState> => {
            return {
                clipsMade: oldState.clipsMade + 1n,
                wire: oldState.wire - 1
            };
        });
    }

    public getWireCost = () => 15;

    public canBuyWire = () => {
        return this.state.funds >= this.getWireCost();
    }

    public buyWire = () => {
        if (!this.canBuyWire()){
            return;
        }

        this.setState((oldState): Partial<IState> => {
            return {
                wire: oldState.wire + 1000,
                funds: oldState.funds - this.getWireCost()
            };
        });
    }

    public canSellClips = () => {
        const { clipsMade, clipsSold } = this.state;
        const clipsLeft = clipsMade - clipsSold;
        return clipsLeft >= 500n;
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
            isRunning,
            isNewSecond,
        } = this.props;
        if (Math.abs(currentFrameTimeMS - previousProps.currentFrameTimeMS) < 0.1) { // if we're rerendering with the same time, don't update
            return;
        } else if (!isRunning){ // if we're paused, definitely don't update
            return;
        }

        this.update(deltaTimeMS, isNewSecond);
    }

    public update = (deltaTimeMS: number, isNewSecond: boolean) => {
        this.setState((oldState: IState): Partial<IState> => {
            const {
                wire: oldWire,
                incompleteClips: oldIncompleteClips,
                autoClippers,
                clipsMade: oldClipsMade
            } = oldState;

            const newState: Partial<IState> = {};

            if (isNewSecond){
                newState.clipsMadeLastSecond = oldClipsMade;
                newState.clipsPerSecond = oldClipsMade - oldState.clipsMadeLastSecond;
            }
            
            const newIncompleteClips = Math.min(oldWire, oldIncompleteClips + autoClippers * (deltaTimeMS / 1000));
            if (newIncompleteClips >= 1){
                const newClipsMade = Math.floor(newIncompleteClips);
                newState.clipsMade = oldClipsMade + BigInt(newClipsMade);
                newState.incompleteClips = newIncompleteClips % 1;
                newState.wire = oldWire - newClipsMade;
            } else {
                newState.incompleteClips = newIncompleteClips;
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
            clipsPerSecond
        } = this.state;
        const newAutoClipperCost = this.nextAutoClipperCost();

        return (
            <div>
                <h1>Clips: {printNumberWithCommas(clipsMade - clipsSold)}</h1>
                <div>Clips made: {clipsMade} | Clips sold: {clipsSold}</div>
                <h2>Clips per second: {printNumberWithCommas(clipsPerSecond)}</h2>
                <hr />
                <button onClick={this.clip} disabled={!this.canClip()}>Build Clip</button>
                <h3>Wire: {printNumberWithCommas(this.state.wire)}</h3>
                <button onClick={this.buyWire} disabled={!this.canBuyWire()}>Buy Wire for ${this.getWireCost()}</button>
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