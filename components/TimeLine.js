import React from "react";

const divStyle = (width, height) => {
  height = height / 7;
  return {
    maxWidth: `${width}px`,
    minWidth: `${width}px`,
    outline: "1px solid yellowgreen",
    maxHeight: `${height}px`,
    minHeight: `${height}px`
  };
};

const TimeLine = (hours, barSize, height) => {
  return hours.map(item => (
    <div style={divStyle(barSize, height)} className="hour">
      {item}
    </div>
  ));
};

export default TimeLine;
