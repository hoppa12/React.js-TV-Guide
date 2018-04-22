import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import TimeLine from "./components/TimeLine";
import timeLineSize from "./components/testTimeLineSize";
import Channel from "./components/Channel";
class App extends Component 
{
  constructor(props) 
  {
    super(props);
    (this.state = 
    {
      time: this.initTime(),
      timeLineSize: null,
      hasLoaded: false,
      timeLineHeight: null
    }),
      (this.globVars = 
      {
        hasLoaded: false,
        skyEPG: null
      });
  }

  initTime() 
  {
    return new Date(new Date().setHours(new Date().getHours(), 0, 0, 0));
  }
  componentWillMount() 
  {
    this.getSkyJSON();
    document.addEventListener("keydown", this._handleKeyDown.bind(this));
  }

  getSkyJSON() 
  {
    fetch("./sky.json")
      .then(data => data.json())

      .then(data => 
      {
        let res = data.channels.map(item => 
        {
          let adjShows = item.program.map(show => 
            {
              show.dur = parseInt(show.dur) * 1000;
              show.start = parseInt(show.start);
              return show;
            });

          item.program = adjShows;
          return item;
        });

        data.channels = res;
        return data;
      })
      .then(data => (this.globVars.skyEPG = data))
      .then(() => this.setState({ hasLoaded: true }));
  }

  componentDidMount() 
  {
    if (!this.state.timeLineSize) 
    {
      const itemWidth = document.querySelector(".hour").clientWidth;
      const itemHeight = document.querySelector(".content").clientHeight;

      this.setState({ timeLineSize: itemWidth, timeLineHeight: itemHeight });
    }
  }
 
  getTime() 
  {
    let currentHour = this.state.time;
    const hourString = hour =>
    hour < 10 ? `0${hour}:00` : `${hour}:00`;
    let arr = [];
    for (let x = -1; x < 3; x++) 
    {
      let hourTime = new Date(currentHour.getTime() + 3600000 * x);
      let res = hourString(new Date(hourTime).getHours());
      arr.push(res);
    }

    return arr;
  }

  _handleKeyDown(e) 
  {
    console.log(this.globVars.skyEPG);
    let myTime;
    switch (e.keyCode) 
    {
      case 39:
        myTime = new Date(this.state.time.getTime() + 3600000);
        this.setState({ time: myTime });
       
        break;
      case 37:
        myTime = new Date(this.state.time.getTime() - 3600000);
        this.setState({ time: myTime });
        break;
      default:
        break;
    }
  }

  render() 
  {
    
    if (this.state.timeLineSize && this.state.hasLoaded) 
    {
      return (
        <div className="App">
          <div className="mainGrid">
            <div className="content">
              <div className="timeline">
                <div className="left"> </div>
                <div className="bar">
                  {TimeLine(
                    this.getTime(),
                    this.state.timeLineSize,
                    this.state.timeLineHeight
                  )}
                </div>
                <div className="spacing" />
              </div>
              {this.globVars.skyEPG.channels
                .filter((item, index) => index < 7)
                .map(channel => (
                  <Channel
                    obj={channel}
                    hourPx={this.state.timeLineSize}
                    height={this.state.timeLineHeight}
                    timeState={this.state.time}
                  />
                ))}
            </div>
            <div className="item">{this.state.timeLineSize}</div>
          </div>
        </div>
      );
    } else 
    {
      return (
        <div className="App">
          <div className="mainGrid">
            <div className="content">
              <div className="timeline">
                <div className="left"> </div>
                <div className="barTest">
                  {timeLineSize(["12:00", "13:00", "14:00", "15:00"])}
                </div>
                <div className="spacing" />
              </div>

              <div className="timeline">
                <div className="left">BBC</div>
                <div className="bar">{TimeLine([1, 2])}</div>
              </div>
            </div>
            <div className="item">Done</div>
          </div>
        </div>
      );
    }
  }
}

export default App;
