import React from "react";
import Pocket from "./pocket";
import {PrankPocket} from "../prediction-entity";

import "./pocket-list.css";

export default class PocketList extends React.Component
  <{
    pockets: {
      pocket: PrankPocket,
      conservation: string,
      isVisible: boolean,
      selection: any,
    }[],
    showAll: () => void,
    setPocketVisibility: (index: number, isVisible: boolean) => void,
    showOnlyPocket: (index: number) => void,
    focusPocket: (index: number) => void,
    highlightPocket: (index: number, isHighlighted: boolean) => void
  }, {}> {

  render() {
    if (this.props.pockets.length === 0) {
      return (
        <div className="pockets">
          <h3 className="text-center">No pockets found</h3>
        </div>
      );
    }
    return (
      <div className="pockets">
        <h3 className="text-center">
          Pockets &nbsp;
          <button
            type="button"
            className="btn btn-outline-secondary btn-show-pockets"
            title="Show all pockets."
            onClick={this.props.showAll}
          >
            <span className="fontello-icon">&#59430;</span>
          </button>
        </h3>
        {this.props.pockets.map((item, index) => (
          <Pocket
            key={index}
            pocket={item.pocket}
            index={index}
            conservation={item.conservation}
            isVisible={item.isVisible}
            setPocketVisibility={this.props.setPocketVisibility}
            showOnlyPocket={this.props.showOnlyPocket}
            focusPocket={this.props.focusPocket}
            highlightPocket={this.props.highlightPocket}
          />
        ))}
      </div>);
  }

}
