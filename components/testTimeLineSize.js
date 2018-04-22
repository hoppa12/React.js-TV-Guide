import React from "react";

const divStyle = {
  flex: 1,

  outline: "1px solid white"
};

const TimeLine = (hours, barSize) => {
  return hours.map(item => (
    <div style={divStyle} className="hour">
      {item}
    </div>
  ));
};

export default TimeLine;
