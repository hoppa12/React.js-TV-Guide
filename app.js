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
      timeLineHeight: null,
      vertical:0,
      horizontal:0,
      
    }),
      (this.globVars = 
      {
        currentChannel:null,
        hasLoaded: false,
        TVEPG: null
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
    fetch("./TV.json")
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
      .then(data => (this.globVars.TVEPG = data))
      .then(() => this.setState({ hasLoaded: true }));
  }

  getCurrentShows(obj)
  {
    let res = JSON.parse(JSON.stringify(obj.program))
      .filter(
        item =>
          (item.start >= this.state.time.getTime() - 3600000 &&
            item.start < this.state.time.getTime() + 3600000 * 3) ||
          (item.start + item.dur > this.state.time.getTime() - 3600000 &&
            item.start < this.state.time.getTime() + 3600000 * 3)
      )
      .map((item, index, arr) => {
        const start = item.start;
        const dur = item.dur;
        const epgStart = this.state.time.getTime() - 3600000;
        const epgEnd = this.state.time.getTime() + 3600000 * 3;
        if (start < epgStart && start + dur > epgStart) 
        {
          const durationComplete = start + dur - epgStart;

          item.start = this.state.time.getTime();
          item.dur = durationComplete;
        }

        if (start + dur > epgEnd) 
        {
          const durationEnd = epgEnd - start;
          item.dur = durationEnd;
        }
        return item;
      })

      this.globVars.currentChannel = res;

      return res;

     
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
    console.log(this.globVars.TVEPG);
    let myTime;
    let newHorizontal;
    let newVertical;
    switch (e.keyCode) 
    {
      case 39:
      //  myTime = new Date(this.state.time.getTime() + 3600000);
       // this.setState({ time: myTime });
       if(this.state.horizontal === this.globVars.currentChannel.length-1)
       {
        myTime = new Date(this.state.time.getTime() + 3600000);
        
       
         this.setState({ time: myTime });
         if(this.globVars.currentChannel.length <=this.state.horizontal )
         {
           let horiz = this.globVars.currentChannel.length-1
          this.setState({ horizontal: horiz });
         }
         break;
       }
       newHorizontal = this.state.horizontal+1;
       this.setState({ horizontal: newHorizontal });
      
        break;
      case 37:
       // myTime = new Date(this.state.time.getTime() - 3600000);
      //  this.setState({ time: myTime });

      if(this.state.horizontal === 0)
      {
        myTime = new Date(this.state.time.getTime() - 3600000);
        
       
         this.setState({ time: myTime });
        break;
      }
      newHorizontal = this.state.horizontal-1;
       this.setState({ horizontal: newHorizontal });
        break;
        case 38:
          //up
          newVertical = this.state.vertical -1
          this.setState({vertical:newVertical,horizontal:0});
          break;

        case 40:
          //down
          newVertical = this.state.vertical +1
          this.setState({vertical:newVertical,horizontal:0});
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
              {this.globVars.TVEPG.channels
                .filter((item, index) => index < 7)
                .map((channel,index) => (
                  
                  <Channel
                    obj={this.getCurrentShows(channel)}
                    hourPx={this.state.timeLineSize}
                    height={this.state.timeLineHeight}
                    horizontal={this.state.horizontal}
                    timeState={this.state.time}
                    title={channel.title}
                    vertical = {index === this.state.vertical}
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
