import React from "react";

const divStyle = (width, height,horizontal) => 
{


  if(horizontal !== undefined)
  {
    return {
      outline: "1px solid yellowgreen",
      overflow: "hidden",
      backgroundColor:"red",
      maxWidth: `${width}px`,
      minWidth: `${width}px`,
      maxHeight: `${height}px`,
      minHeight: `${height}px`
    };
  }
  else
  {
    return {
      outline: "1px solid yellowgreen",
      overflow: "hidden",
      maxWidth: `${width}px`,
      minWidth: `${width}px`,
      maxHeight: `${height}px`,
      minHeight: `${height}px`
    };

  }
  
};

const width = (dur, hourPx, index, arr) => hourPx / 3600 * (dur / 1000);

const Channel = props => {
  let { obj, timeState, hourPx, height ,horizontal,title,vertical} = props;
  height = height / 7;

  const mapper = (obj, timeState, hourPx, height) => {
   
   return obj.map((item, index, arr) => (
        <div
          style={divStyle(width(item.dur, hourPx, index, arr), height,index === horizontal && vertical ? horizontal : undefined)}
          className="show"
        >
          {item.title}
        </div>
      ));
  };

  return (
    <div className="timeline">
      <div className="left">{title} </div>
      <div className="showbar">{mapper(obj, timeState, hourPx, height)} </div>
      <div className="spacing"> </div>
    </div>
  );
};

export default Channel;
