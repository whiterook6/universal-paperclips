import { Component } from "preact";
import { printNumberWithCommas } from "./format";
import ReactFlow, { Background, MarkerType, Position } from "reactflow";
import "reactflow/dist/base.css";

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

export class Game extends Component<IProps, IState> {
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
    clipsPerSecond: 0n,
  };

  public canBuyAutoClipper = () => {
    return this.state.funds >= this.nextAutoClipperCost();
  };

  public buyAutoClipper = () => {
    if (!this.canBuyAutoClipper()) {
      return;
    }

    this.setState((oldState) => {
      return {
        ...oldState,
        autoClippers: oldState.autoClippers + 1,
        funds: oldState.funds - this.nextAutoClipperCost(),
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

  public getWireCost = (wires: number = 1000) => wires * 0.015;

  public canBuyWire = (wires: number = 1000) => {
    return this.state.funds >= this.getWireCost(wires);
  };

  public buyWire = (wires: number = 1000) => {
    if (!this.canBuyWire(wires)) {
      return;
    }

    this.setState((oldState): Partial<IState> => {
      return {
        wire: oldState.wire + wires,
        funds: oldState.funds - this.getWireCost(wires),
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
        funds: oldState.funds + this.state.costPerClip * Number(howMany),
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
    const { clipsMade, clipsSold, autoClippers, funds, clipsPerSecond } =
      this.state;
    const unsoldClips = clipsMade - clipsSold;
    const newAutoClipperCost = this.nextAutoClipperCost();
    const wireStyle = {
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#FF0072",
      },
      type: "smoothstep",
      style: {
        strokeWidth: 2,
        stroke: "#FF0072",
      },
    };
    const nodes = [
      {
        id: "wire",
        data: { label: `Wire: ${printNumberWithCommas(this.state.wire)}` },
        position: { x: 0, y: 200 },
        sourcePosition: Position.Right,
        targetPosition: Position.Bottom,
      },
      {
        id: "autoclippers",
        data: { label: `Autoclippers: ${printNumberWithCommas(autoClippers)}` },
        position: { x: 100, y: 100 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "build-clip",
        data: { label: "Build Clip" },
        position: { x: 100, y: 300 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "unsold-clips",
        data: { label: `Unsold Clips: ${printNumberWithCommas(unsoldClips)}` },
        position: { x: 150, y: 200 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "sell-clips",
        data: { label: "Sell Clips" },
        position: { x: 400, y: 200 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "funds",
        data: { label: `Funds: $${funds.toFixed(2)}` },
        position: { x: 550, y: 200 },
        targetPosition: Position.Left,
      },
      {
        id: "buy-wire",
        data: { label: "Buy Wire" },
        position: { x: 100, y: 400 },
        sourcePosition: Position.Left,
        targetPosition: Position.Right,
      },
      {
        id: "buy-autoclippers",
        data: { label: "Buy Autoclipper" },
        position: { x: 200, y: 0 },
        sourcePosition: Position.Left,
        targetPosition: Position.Right,
      },
    ];
    const edges = [
      {
        id: "wire-autoclippers",
        source: "wire",
        target: "autoclippers",
        ...wireStyle,
      },
      {
        id: "wire-build-clip",
        source: "wire",
        target: "build-clip",
        ...wireStyle,
      },
      {
        id: "build-clip-unsold-clips",
        source: "build-clip",
        target: "unsold-clips",
        ...wireStyle,
      },
      {
        id: "autoclippers-unsold-clips",
        source: "autoclippers",
        target: "unsold-clips",
        ...wireStyle,
      },
      {
        id: "unsold-clips-sell-clips",
        source: "unsold-clips",
        target: "sell-clips",
        ...wireStyle,
      },
      {
        id: "sell-clips-funds",
        source: "sell-clips",
        target: "funds",
        ...wireStyle,
      },
      { id: "buy-wire-wire", source: "buy-wire", target: "wire", ...wireStyle },
      {
        id: "buy-autoclippers-autoclippers",
        source: "buy-autoclippers",
        target: "autoclippers",
        ...wireStyle,
      },
      {
        id: "buy-wire-funds",
        source: "funds",
        target: "buy-wire",
        ...wireStyle,
      },
      {
        id: "buy-autoclippers-funds",
        source: "funds",
        target: "buy-autoclippers",
        ...wireStyle,
      },
    ];

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
          <h3>Wire: {printNumberWithCommas(this.state.wire)}</h3>
          <button
            onClick={() => this.buyWire(500)}
            disabled={!this.canBuyWire(500)}
          >
            Buy 500 Wire for ${this.getWireCost(500).toFixed(2)}
          </button>
          <button
            onClick={() => this.buyWire(1000)}
            disabled={!this.canBuyWire(1000)}
          >
            Buy 1000 Wire for ${this.getWireCost(1000).toFixed(2)}
          </button>
          <button
            onClick={() => this.buyWire(2000)}
            disabled={!this.canBuyWire(2000)}
          >
            Buy 2000 Wire for ${this.getWireCost(2000).toFixed(2)}
          </button>
          <hr />
          <h3>Funds: ${funds.toFixed(2)}</h3>
          <button
            disabled={!this.canSellClips(100n)}
            onClick={() => this.sellClips(100n)}
          >
            Sell 100 clips for ${(this.state.costPerClip * 100).toFixed(2)}
          </button>
          <button
            disabled={!this.canSellClips(200n)}
            onClick={() => this.sellClips(200n)}
          >
            Sell 200 clips for ${(this.state.costPerClip * 200).toFixed(2)}
          </button>
          <button
            disabled={!this.canSellClips(500n)}
            onClick={() => this.sellClips(500n)}
          >
            Sell 500 clips for ${(this.state.costPerClip * 500).toFixed(2)}
          </button>
          <h3>Autoclippers: {printNumberWithCommas(autoClippers)}</h3>
          <button
            disabled={!this.canBuyAutoClipper()}
            onClick={this.buyAutoClipper}
          >
            Buy AutoClipper (${newAutoClipperCost.toFixed(2)})
          </button>
        </div>
        <ReactFlow nodes={nodes} edges={edges}>
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
    );
  };

  private nextAutoClipperCost = () => {
    return Math.pow(1.05, this.state.autoClippers) * 5;
  };
}
