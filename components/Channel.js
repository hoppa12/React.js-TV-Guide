import React from "react";

const divStyle = (width, height) => {
  return {
    outline: "1px solid yellowgreen",
    overflow: "hidden",
    maxWidth: `${width}px`,
    minWidth: `${width}px`,
    maxHeight: `${height}px`,
    minHeight: `${height}px`
  };
};

const width = (dur, hourPx, index, arr) => hourPx / 3600 * (dur / 1000);

const Channel = props => {
  let { obj, timeState, hourPx, height } = props;
  height = height / 7;

  const mapper = (obj, timeState, hourPx, height) => {
    return JSON.parse(JSON.stringify(obj.program))
      .filter(
        item =>
          (item.start >= timeState.getTime() - 3600000 &&
            item.start < timeState.getTime() + 3600000 * 3) ||
          (item.start + item.dur > timeState.getTime() - 3600000 &&
            item.start < timeState.getTime() + 3600000 * 3)
      )
      .map((item, index, arr) => {
        const start = item.start;
        const dur = item.dur;
        const epgStart = timeState.getTime() - 3600000;
        const epgEnd = timeState.getTime() + 3600000 * 3;
        if (start < epgStart && start + dur > epgStart) 
        {
          const durationComplete = start + dur - epgStart;

          item.start = timeState.getTime();
          item.dur = durationComplete;
        }

        if (start + dur > epgEnd) 
        {
          const durationEnd = epgEnd - start;
          item.dur = durationEnd;
        }
        return item;
      })

      .map((item, index, arr) => (
        <div
          style={divStyle(width(item.dur, hourPx, index, arr), height)}
          className="show"
        >
          {item.title}
        </div>
      ));
  };

  return (
    <div className="timeline">
      <div className="left">{obj.title} </div>
      <div className="showbar">{mapper(obj, timeState, hourPx, height)} </div>
      <div className="spacing"> </div>
    </div>
  );
};

export default Channel;
