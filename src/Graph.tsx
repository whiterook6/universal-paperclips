import { Component } from "preact";
import { printCost, printNumberWithCommas } from "./format";
import ReactFlow, { Background, Edge, MarkerType, Node, Position } from "reactflow";
import "reactflow/dist/base.css";
import { PureComponent } from "preact/compat";

interface IProps {
  wire: number;
  unsoldClips: bigint;
  autoClippers: number;
  pennies: bigint;
}

export const Graph = (props: IProps) => {
  const { wire, unsoldClips, autoClippers, pennies } = props;
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
  const nodes: Node[] = [
    {
      id: "wire",
      data: { label: `Wire: ${printNumberWithCommas(wire)}`, value: 1 },
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
      position: { x: 200, y: 200 },
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
      data: { label: `Funds: ${printCost(pennies)}` },
      position: { x: 550, y: 200 },
      sourcePosition: Position.Right,
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
  const edges: Edge[] = [
    {
      id: "wire-autoclippers",
      source: "wire",
      target: "autoclippers",
      ...wireStyle,
      animated: true,
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
      animated: true,
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
    <ReactFlow nodes={nodes} edges={edges}>
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  );
};