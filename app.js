import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import TimeLine from "./components/TimeLine";
import timeLineSize from "./components/testTimeLineSize";
import Channel from "./components/Channel";
import Categories from "./components/Categories";
class App extends Component {
  constructor(props) {
    super(props);
    (this.state = {
      time: this.initTime(),
      timeLineSize: null,
      hasLoaded: false,
      timeLineHeight: null,
      vertical: 0,
      horizontal: 0,

      menuDisplayed: true,
      min: 0,
      max: 3
    }),
      (this.globVars = {
        channelPositon: null,
        totalChannels: null,
        currentChannel: null,
        hasLoaded: false,
        TVEPG: null,
        categories: [],
        selectedNum: null,
        SelectedCategory: 0
      });
  }
  //Selected Num is the Current Category

  initTime() {
    return new Date(new Date().setHours(new Date().getHours(), 0, 0, 0));
  }
  componentWillMount() {
    this.getSkyJSON();
    document.addEventListener("keydown", this._handleKeyDown.bind(this));
  }

  getSkyJSON() {
    let results = [];
    results.push(
      fetch("./TV.json")
        .then(data => data.json())

        .then(data => {
          let res = data.channels.map(item => {
            let adjShows = item.program.map(show => {
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
    );
    results.push(
      fetch("ntv.json")
        .then(data => data.json())
        .then(data => (this.globVars.ntv = data))
        .then(() => {
          this.globVars.categories = [
            ...new Set(this.globVars.ntv.contents.map(item => item.genre))
          ];
        })
    );

    Promise.all(results).then(data => this.setState({ hasLoaded: true }));
  }

  getCurrentShows(obj, vertical) {
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
        if (start < epgStart && start + dur > epgStart) {
          const durationComplete = start + dur - epgStart;

          item.start = this.state.time.getTime();
          item.dur = durationComplete;
        }

        if (start + dur > epgEnd) {
          const durationEnd = epgEnd - start;
          item.dur = durationEnd;
        }
        return item;
      });

    if (vertical) {
      this.globVars.currentChannel = res;
    }

    return res;
  }

  componentDidMount() {
    if (!this.state.timeLineSize) {
      const itemWidth = document.querySelector(".hour").clientWidth;
      const itemHeight = document.querySelector(".content").clientHeight;

      this.setState({ timeLineSize: itemWidth, timeLineHeight: itemHeight });
    }
  }

  getTime() {
    let currentHour = this.state.time;
    const hourString = hour => (hour < 10 ? `0${hour}:00` : `${hour}:00`);
    let arr = [];
    for (let x = -1; x < 3; x++) {
      let hourTime = new Date(currentHour.getTime() + 3600000 * x);
      let res = hourString(new Date(hourTime).getHours());
      arr.push(res);
    }

    return arr;
  }

  handleCategoryMenu(e) {
    let res;

    switch (e.keyCode) {
      case 38:
        if (this.state.vertical === 0) {
          res = 0;
        } else {
          res = this.state.vertical -= 1;
        }

        //this.globVars.Category -=  1;

        this.setState({ vertical: res, horizontal: 0 });
        break;

      case 40:
        if (this.state.vertical === this.globVars.categories.length - 1) {
          break;
        } else {
          res = this.state.vertical += 1;
        }

        //this.globVars.Category -=  1;

        this.setState({ vertical: res, horizontal: 0 });
        break;
      case 13:
        this.globVars.selectedNum = this.state.vertical;
        this.globVars.channelPositon = 0;
        let categoryChannel = this.globVars.ntv.contents.filter(
          item =>
            item.genre ===
              this.globVars.categories[this.globVars.selectedNum] &&
            item.sky !== undefined
        );
        console.log(categoryChannel);
        this.setState({ vertical: 0, menuDisplayed: false });

        break;
      default:
        break;
    }
  }

  handleEPGMenuUpDown(e) {
    let verticalState;
    switch (e.keyCode) {
      case 38:
        //up

        verticalState = this.state.vertical - 1;
        this.globVars.channelPositon -= 1;
        if (this.globVars.channelPositon < 0) {
          this.globVars.channelPositon = 0;
          this.setState({ vertical: 0, menuDisplayed: true });
          break;
        }
        console.log(this.globVars.channelPositon);

        if (this.state.min > this.globVars.channelPositon) {
          let res = this.state.min - 1;
          this.setState({ horizontal: 0, min: res });
          break;
        }
        this.setState({ vertical: verticalState, horizontal: 0 });

        break;

      case 40:
        verticalState = this.state.vertical + 1;
        if (this.state.menuDisplayed) {
          this.handleCategoryMenu(e);
          break;
        }
        this.globVars.selectedNum += 1;

        if (this.state.vertical >= this.globVars.categories.length - 1) {
          this.setState({ vertical: this.globVars.categories.length - 1 });
          break;
        }

        this.globVars.channelPositon += 1;
        console.log(this.globVars.channelPositon);
        if (
          this.globVars.channelPositon >= this.globVars.totalChannels &&
          !this.state.menuDisplayed
        ) {
          let res = this.state.min + 1;
          verticalState = this.state.vertical + 1;

          this.setState({ horizontal: 0, min: res });
          break;
        }
        verticalState = this.state.vertical + 1;
        this.setState({ vertical: verticalState, horizontal: 0 });
        break;
    }
  }

  handleEPGMenuLeftRight(e) {
    let myTime;
    let newHorizontal;
    let newVertical;

    switch (e.keyCode) {
      case 39:
        //  myTime = new Date(this.state.time.getTime() + 3600000);
        // this.setState({ time: myTime });

        if (this.state.horizontal === this.globVars.currentChannel.length - 1) {
          myTime = new Date(this.state.time.getTime() + 3600000);

          if (this.globVars.currentChannel.length <= this.state.horizontal) {
            let horiz = this.globVars.currentChannel.length - 1;
            this.setState({ horizontal: horiz, time: myTime });
            break;
          }

          this.setState({ time: myTime });
          break;
        }

        newHorizontal = this.state.horizontal + 1;
        this.setState({ horizontal: newHorizontal });

        break;
      case 37:
        if (
          this.state.horizontal === 0 &&
          this.globVars.currentChannel.length > 0
        ) {
          myTime = new Date(this.state.time.getTime() - 3600000);

          this.setState({ time: myTime });
          break;
        }
        if (!this.globVars.currentChannel.length) {
          myTime = new Date(this.state.time.getTime() + 3600000);

          this.setState({ time: myTime });
          if (this.globVars.currentChannel.length <= this.state.horizontal) {
            let horiz = this.globVars.currentChannel.length - 1;
            this.setState({ horizontal: horiz });
          }
          break;
        }
        newHorizontal = this.state.horizontal - 1;
        this.setState({ horizontal: newHorizontal });
        break;
    }
  }
  _handleKeyDown(e) {
    let myTime;
    let newHorizontal;
    let newVertical;
    switch (e.keyCode) {
      case 39:
        if (!this.state.menuDisplayed) {
          this.handleEPGMenuLeftRight(e);
        }
        break;

      case 37:
        if (!this.state.menuDisplayed) {
          this.handleEPGMenuLeftRight(e);
        }
        break;

      case 38:
        //up

        if (this.state.menuDisplayed) {
          this.handleCategoryMenu(e);
          break;
        } else {
          this.handleEPGMenuUpDown(e);
          break;
        }

      case 40:
        //down

        if (this.state.menuDisplayed) {
          this.handleCategoryMenu(e);
          break;
        } else {
          this.handleEPGMenuUpDown(e);
          break;
        }

      case 13:
        if (this.state.menuDisplayed) {
          this.handleCategoryMenu(e);
          break;
          this.globVars.selectedNum = this.state.vertical;
          this.globVars.channelPositon = 0;

          this.setState({ vertical: 0, menuDisplayed: false });
        }
        break;
      default:
        break;
    }
  }

  getChannelLength() {
    let res = this.globVars.TVEPG.channels.filter(
      (item, index) =>
        this.state.min === index ||
        (this.state.min + 5 >= index && index > this.state.min)
    );
    this.globVars.totalChannels = res.length;

    return res;
  }

  render() {
    let days = ["Mon", "Tue", "Wed", "Thurs", "Fri", "Sat", "Sun"];
    let months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    if (this.state.hasLoaded && this.state.menuDisplayed) {
      return (
        <Categories
          categories={this.globVars.categories}
          vertical={this.state.vertical}
        />
      );
    }
    if (this.state.timeLineSize && this.state.hasLoaded) {
      return (
        <div className="App">
          <div className="mainGrid">
            <div className="content">
              <div className="timeline">
                <div className="left">
                  <b>
                    {days[this.state.time.getDay()]} {this.state.time.getDate()}{" "}
                    {months[this.state.time.getMonth()]}
                  </b>{" "}
                </div>
                <div className="bar">
                  {TimeLine(
                    this.getTime(),
                    this.state.timeLineSize,
                    this.state.timeLineHeight
                  )}
                </div>
                <div className="spacing" />
              </div>
              {this.getChannelLength().map((channel, index) => (
                <Channel
                  obj={this.getCurrentShows(
                    channel,
                    index === this.state.vertical
                  )}
                  hourPx={this.state.timeLineSize}
                  height={this.state.timeLineHeight}
                  horizontal={this.state.horizontal}
                  timeState={this.state.time}
                  title={channel.title}
                  vertical={index === this.state.vertical}
                />
              ))}
            </div>
            <div className="item">{this.state.timeLineSize}</div>
          </div>
        </div>
      );
    } else {
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
