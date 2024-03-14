import { Component } from "preact";
import { printCost, printNumberWithCommas } from "./format";
import ReactFlow, { Background, MarkerType, Position } from "reactflow";
import "reactflow/dist/base.css";
import { Graph } from "./Graph";

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
  pennies: bigint;
  penniesPerClip: bigint;
  clipsMadeLastSecond: bigint;
  clipsPerSecond: bigint;
}

export class Game extends Component<IProps, IState> {
  public state: IState = {
    incompleteClips: 0,
    incompleteAutoClippers: 0,
    wire: 1000,
    clipsMade: 0n,
    clipsSold: 0n,
    autoClippers: 5,
    pennies: 0n,
    penniesPerClip: 5n,
    clipsMadeLastSecond: 0n,
    clipsPerSecond: 0n,
  };

  public canBuyAutoClipper = () => {
    return this.state.pennies > this.nextAutoClipperCostInPennies();
  };

  public buyAutoClipper = () => {
    if (!this.canBuyAutoClipper()) {
      return;
    }

    this.setState((oldState) => {
      return {
        ...oldState,
        autoClippers: oldState.autoClippers + 1,
        pennies: oldState.pennies - this.nextAutoClipperCostInPennies(),
      };
    });
  };

  public canClip = () => {
    return this.state.wire > 0;
  };

  public clip = () => {
    if (!this.canClip()) {
      return;
    }
    this.setState((oldState): Partial<IState> => {
      return {
        clipsMade: oldState.clipsMade + 1n,
        wire: oldState.wire - 1,
      };
    });
  };

  public getWireCostInPennies = (wires: number = 1000) => BigInt(wires * 1.5);

  public canBuyWire = (wires: number = 1000) => {
    return this.state.pennies > this.getWireCostInPennies(wires);
  };

  public buyWire = (wires: number = 1000) => {
    if (!this.canBuyWire(wires)) {
      return;
    }

    this.setState((oldState): Partial<IState> => {
      return {
        wire: oldState.wire + wires,
        pennies: oldState.pennies - this.getWireCostInPennies(wires),
      };
    });
  };

  public canSellClips = (howMany: bigint = 500n) => {
    const { clipsMade, clipsSold } = this.state;
    const clipsLeft = clipsMade - clipsSold;
    return clipsLeft >= howMany;
  };

  public sellClips = (howMany: bigint = 500n) => {
    if (!this.canSellClips(howMany)) {
      return;
    }

    this.setState((oldState): Partial<IState> => {
      return {
        clipsSold: oldState.clipsSold + howMany,
        pennies: oldState.pennies + this.state.penniesPerClip * howMany,
      };
    });
  };

  public componentDidUpdate(previousProps: Readonly<IProps>): void {
    const { currentFrameTimeMS, deltaTimeMS, isRunning, isNewSecond } =
      this.props;
    if (Math.abs(currentFrameTimeMS - previousProps.currentFrameTimeMS) < 0.1) {
      // if we're rerendering with the same time, don't update
      return;
    } else if (!isRunning) {
      // if we're paused, definitely don't update
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
        clipsMade: oldClipsMade,
      } = oldState;

      const newState: Partial<IState> = {};

      if (isNewSecond) {
        newState.clipsMadeLastSecond = oldClipsMade;
        newState.clipsPerSecond = oldClipsMade - oldState.clipsMadeLastSecond;
      }

      const newIncompleteClips = Math.min(
        oldWire,
        oldIncompleteClips + autoClippers * (deltaTimeMS / 1000)
      );
      if (newIncompleteClips >= 1) {
        const newClipsMade = Math.floor(newIncompleteClips);
        newState.clipsMade = oldClipsMade + BigInt(newClipsMade);
        newState.incompleteClips = newIncompleteClips % 1;
        newState.wire = oldWire - newClipsMade;
      } else {
        newState.incompleteClips = newIncompleteClips;
      }

      return newState;
    });
  };

  public render = () => {
    const { clipsMade, clipsSold, autoClippers, pennies, clipsPerSecond, wire } =
      this.state;
    const unsoldClips = clipsMade - clipsSold;

    return (
      <div id="container">
        <div id="sidebar">
          <h1>Clips: {printNumberWithCommas(unsoldClips)}</h1>
          <div>
            Clips made: {clipsMade}
            <br />
            Clips sold: {clipsSold}
          </div>
          <h2>Clips per second: {printNumberWithCommas(clipsPerSecond)}</h2>
          <hr />
          <button onClick={this.clip} disabled={!this.canClip()}>
            Build Clip
          </button>
          <h3>Wire: {printNumberWithCommas(wire)}</h3>
          <button
            onClick={() => this.buyWire(500)}
            disabled={!this.canBuyWire(500)}
          >
            Buy 500 Wire for {printCost(this.getWireCostInPennies(500))}
          </button>
          <button
            onClick={() => this.buyWire(1000)}
            disabled={!this.canBuyWire(1000)}
          >
            Buy 1000 Wire for {printCost(this.getWireCostInPennies(1000))}
          </button>
          <button
            onClick={() => this.buyWire(2000)}
            disabled={!this.canBuyWire(2000)}
          >
            Buy 2000 Wire for {printCost(this.getWireCostInPennies(2000))}
          </button>
          <hr />
          <h3>Funds: {printCost(pennies)}</h3>
          <button
            disabled={!this.canSellClips(100n)}
            onClick={() => this.sellClips(100n)}
          >
            Sell 100 clips for {printCost(this.state.penniesPerClip * 100n)}
          </button>
          <button
            disabled={!this.canSellClips(200n)}
            onClick={() => this.sellClips(200n)}
          >
            Sell 200 clips for {printCost(this.state.penniesPerClip * 200n)}
          </button>
          <button
            disabled={!this.canSellClips(500n)}
            onClick={() => this.sellClips(500n)}
          >
            Sell 500 clips for {printCost(this.state.penniesPerClip * 500n)}
          </button>
          <h3>Autoclippers: {printNumberWithCommas(autoClippers)}</h3>
          <button
            disabled={!this.canBuyAutoClipper()}
            onClick={this.buyAutoClipper}
          >
            Buy AutoClipper ({printCost(this.nextAutoClipperCostInPennies())})
          </button>
        </div>
        <Graph
          autoClippers={autoClippers}
          pennies={pennies}
          unsoldClips={unsoldClips}
          wire={wire}
        />
      </div>
    );
  };

  private nextAutoClipperCostInPennies = (): bigint => {
    return BigInt(Math.round(Math.pow(1.05, this.state.autoClippers) * 500));
  };
}
