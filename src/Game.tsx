import { Component } from "preact";
import { printNumberWithCommas, printBigIntWithWords } from "./format";

interface IProps {
    currentFrameTimeMS: number;
    previousFrameTimeMS: number;
    isRunning: boolean;
}

interface IState {
    wire: number;
    incompleteClip: number;
    incompleteAutoClippers: number;
    clips: bigint;
    autoClippers: number;
    funds: number;
}

export class Game extends Component<IProps, IState>{
    public state: IState = {
        incompleteClip: 0,
        incompleteAutoClippers: 0,
        wire: 1000,
        clips: 100000000000000000000000000n,
        autoClippers: 100000000000000000,
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
            const newState: Partial<IState> = {};
            const newIncompleteClips = oldState.incompleteClip + oldState.autoClippers * (deltaTimeMS / 1000);
            if (newIncompleteClips > 1) {
                newState.clips = oldState.clips + BigInt(Math.floor(newIncompleteClips));
                newState.incompleteClip = newIncompleteClips % 1;
            } else {
                newState.incompleteClip = newIncompleteClips;
            }

            const newIncompleteAutoClippers = oldState.incompleteAutoClippers + (deltaTimeMS);
            if (newIncompleteAutoClippers > 1) {
                newState.autoClippers = oldState.autoClippers + Math.floor(newIncompleteAutoClippers);
                newState.incompleteAutoClippers = newIncompleteAutoClippers % 1;
            } else {
                newState.incompleteAutoClippers = newIncompleteAutoClippers;
            }

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
                <h1>Clips: {printNumberWithCommas(clips)}</h1>
                <div>{printBigIntWithWords(clips)}</div>
                <h2>Clips per second: {printNumberWithCommas(autoClippers)}</h2>
                <hr />
                <h3>Funds: {funds}</h3>
                <h3>Autoclippers: {printNumberWithCommas(autoClippers)}</h3>
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