"use strict";

class PrefixInput extends React.Component {
  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5 block">Scan Networks</label>
        </div>
        <div className="block">
          <textarea
            type="text"
            name="prefix_list_input"
            className={
              "textarea" +
              (this.props.task_arg_validity_map.prefix_list ? "" : " is-danger")
            }
            rows="20"
            autoComplete="off"
            placeholder="192.168.0.0/24"
            value={this.props.prefix_list_input.join("\n")}
            onChange={this.props.handle_change}
          ></textarea>
        </div>
      </div>
    );
  }
}

class ScannerInput extends React.Component {
  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5 block">Scanners</label>
        </div>
        <div className="block">
          <textarea
            type="text"
            name="scanner_list_input"
            className={
              "textarea" +
              (this.props.task_arg_validity_map.scanner_list
                ? ""
                : " is-danger")
            }
            rows="20"
            autoComplete="off"
            placeholder={this.props.agent_list.join("\n")}
            value={this.props.scanner_list_input.join("\n")}
            onChange={this.props.handle_change}
          ></textarea>
        </div>
      </div>
    );
  }
}

class RepeatInput extends React.Component {
  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5 block">Repeat</label>
        </div>
        <div className="block">
          <input
            type="number"
            name="repeat_input"
            className={
              "input" +
              (this.props.task_arg_validity_map.repeat ? "" : " is-danger")
            }
            placeholder="100"
            value={this.props.repeat_input}
            onChange={this.props.handle_change}
          ></input>
        </div>
      </div>
    );
  }
}

class IntervalInput extends React.Component {
  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5 block">
            Interval
            <label className="subtitle is-6 block">&nbsp;(Sec)</label>
          </label>
        </div>
        <div className="block">
          <input
            type="number"
            name="interval_input"
            className={
              "input" +
              (this.props.task_arg_validity_map.interval ? "" : " is-danger")
            }
            placeholder="60"
            value={this.props.interval_input}
            onChange={this.props.handle_change}
          ></input>
        </div>
      </div>
    );
  }
}

class InputControl extends React.Component {
  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5 block">Operation</label>
        </div>
        <div className="block">
          <button
            name="start_button"
            className="button is-info"
            onClick={this.props.handle_click}
          >
            Scan
          </button>
        </div>
      </div>
    );
  }
}

class ScanCreator extends React.Component {
  render() {
    if (this.props.ui_mode == "creator") {
      return (
        <div className="container">
          <div className="block pt-5">
            <div className="columns">
              <div className="column is-half">
                <ScannerInput
                  handle_change={this.props.handle_change}
                  scanner_list_input={this.props.scanner_list_input}
                  agent_list={this.props.agent_list}
                  task_arg_validity_map={this.props.task_arg_validity_map}
                />
              </div>
              <div className="column is-half">
                <PrefixInput
                  handle_change={this.props.handle_change}
                  prefix_list_input={this.props.prefix_list_input}
                  task_arg_validity_map={this.props.task_arg_validity_map}
                />
              </div>
            </div>
          </div>
          <div className="block pt-5">
            <div className="columns">
              <div className="column is-one-quarter">
                <RepeatInput
                  handle_change={this.props.handle_change}
                  repeat_input={this.props.repeat_input}
                  task_arg_validity_map={this.props.task_arg_validity_map}
                />
              </div>
              <div className="column is-one-quarter">
                <IntervalInput
                  handle_change={this.props.handle_change}
                  interval_input={this.props.interval_input}
                  task_arg_validity_map={this.props.task_arg_validity_map}
                />
              </div>
            </div>
          </div>
          <div className="block pt-5">
            <InputControl handle_click={this.props.handle_click} />
          </div>
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}

class RenderControl extends React.Component {
  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5">Render Control</label>
        </div>
        <div className="columns is-6 is-variable">
          <div className="column is-one-quarter">
            <div className="block">
              <label className="subtitle is-6 block">Render Step</label>
            </div>
            <div className="block">
              <input
                type="number"
                name="max_render_step_input"
                className="input"
                placeholder="6"
                max="12"
                min="3"
                value={this.props.max_render_step}
                onChange={this.props.handle_change}
              ></input>
            </div>
          </div>
          <div className="column is-one-quarter">
            <div className="block">
              <label className="subtitle is-6 block">
                Highlight
                <label className="subtitle is-6">
                  &nbsp;(Dead IP increase over)
                </label>
              </label>
            </div>
            <div className="block">
              <input
                type="number"
                name="highlight_dead_addr_diff_input"
                className="input"
                placeholder="4"
                min="0"
                value={this.props.highlight_dead_addr_diff}
                onChange={this.props.handle_change}
              ></input>
            </div>
          </div>
          <div className="column is-one-quarter">
            <div className="block">
              <label className="subtitle is-6 block">
                Highlight
                <label className="subtitle is-6">
                  &nbsp;(Avg. RRT increase over)
                </label>
              </label>
            </div>
            <div className="block">
              <input
                type="number"
                name="highlight_avg_rrt_diff_input"
                className="input"
                placeholder="10"
                min="0"
                value={this.props.highlight_avg_rrt_diff}
                onChange={this.props.handle_change}
              ></input>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class ScannerCanvas extends React.Component {
  decide_scanner_button_color(scanner) {
    if (scanner == this.props.render_scanner) {
      return "is-info";
    }
    let scanner_button_color_level = 0;
    let render_step_list = this.props.gen_render_step_list(scanner);
    let scan_scanner_out = this.props.scan_out[scanner];
    for (let prefix in scan_scanner_out) {
      let scan_prefix_out = scan_scanner_out[prefix];
      for (const step of render_step_list) {
        let scan_step_out = scan_prefix_out[step];
        if (scan_step_out && scan_step_out.alive_addr_count == 0) {
          scanner_button_color_level = 2;
        } else if (
          scan_step_out &&
          scanner_button_color_level < 1 &&
          (scan_step_out.dead_addr_diff_list.length >
            this.props.highlight_dead_addr_diff ||
            scan_step_out.avg_rrt_diff > this.props.highlight_avg_rrt_diff)
        ) {
          scanner_button_color_level = 1;
        }
      }
    }
    switch (scanner_button_color_level) {
      case 0: {
        return "is-success is-light";
      }
      case 1: {
        return "is-warning is-light";
      }
      case 2: {
        return "is-danger is-light";
      }
    }
  }

  decide_scanner_button_icon(scanner) {
    if (this.props.scanner_running_map[scanner]) {
      return "fas fa-circle-notch fa-spin";
    } else {
      return "far fa-stop-circle";
    }
  }

  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5">Scanner</label>
        </div>
        <div className="field is-grouped">
          {Object.keys(this.props.scan_out).map((scanner) => (
            <button
              className={
                "button ml-4 " + this.decide_scanner_button_color(scanner)
              }
              key={"render_scanner_button_" + scanner}
              name="render_scanner_button"
              data-scanner={scanner}
              onClick={this.props.handle_click}
            >
              <span>{scanner}</span>
              <span className="icon">
                <i className={this.decide_scanner_button_icon(scanner)}></i>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }
}

class ScanOutCanvas extends React.Component {
  decide_step_button_color(prefix, step) {
    if (prefix == this.props.render_prefix && step == this.props.render_step) {
      return "is-info";
    }
    let scan_step_out =
      this.props.scan_out[this.props.render_scanner][prefix][step];
    if (scan_step_out && scan_step_out.alive_addr_count == 0) {
      return "is-danger is-light";
    } else if (
      scan_step_out &&
      (scan_step_out.dead_addr_diff_list.length >
        this.props.highlight_dead_addr_diff ||
        scan_step_out.avg_rrt_diff > this.props.highlight_avg_rrt_diff)
    ) {
      return "is-warning is-light";
    }
    return "is-white";
  }

  render() {
    let render_step_list = this.props.gen_render_step_list(
      this.props.render_scanner
    );
    let render_scan_out = this.props.scan_out[this.props.render_scanner];
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5">Scan Result</label>
        </div>
        <div className="block">
          <div className="columns">
            <div className="column py-2">
              <button className="button is-white">
                <b>Prefix</b>
              </button>
            </div>
            {render_step_list.map((step) => (
              <div className="column py-2" key={"th_step_" + step}>
                <button className="button is-white">
                  <b>{"Step " + (step + 1)}</b>
                </button>
              </div>
            ))}
          </div>
          {Object.keys(render_scan_out).map((prefix) => (
            <div key={prefix} className="columns">
              <div className="column py-2">
                <button className="button is-white">{prefix}</button>
              </div>
              {render_step_list.map((step) => (
                <div
                  key={"tr_prefix" + prefix + "_step_" + step}
                  className="column py-2"
                >
                  <button
                    className={
                      "button " + this.decide_step_button_color(prefix, step)
                    }
                    name="render_prefix_step_button"
                    data-prefix={render_scan_out[prefix][step] ? prefix : ""}
                    data-step={render_scan_out[prefix][step] ? step : ""}
                    onClick={this.props.handle_click}
                  >
                    {render_scan_out[prefix][step]
                      ? render_scan_out[prefix][step].alive_addr_count +
                        " , " +
                        render_scan_out[prefix][step].avg_rrt +
                        "ms"
                      : "..."}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

class ScanOutDetailCanvas extends React.Component {
  render() {
    let render_data_flag = false;
    let render_scan_out;
    let render_scan_step_out;
    if (this.props.render_prefix && this.props.render_step) {
      render_data_flag = true;
      render_scan_out = this.props.scan_out[this.props.render_scanner];
      render_scan_step_out =
        render_scan_out[this.props.render_prefix][this.props.render_step];
    }
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5">Scan Result Detail</label>
        </div>
        <div className="block">
          <div className="columns">
            <div className="column is-half">
              <table className="table is-fullwidth">
                <thead>
                  <tr>
                    <th className="py-2">Key</th>
                    <th className="py-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">Scanner</td>
                    <td className="py-2">
                      {render_data_flag ? this.props.render_scanner : ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Prefix</td>
                    <td className="py-2">
                      {render_data_flag ? this.props.render_prefix : ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Step</td>
                    <td className="py-2">
                      {render_data_flag
                        ? Number(this.props.render_step) + 1
                        : ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Alive address number</td>
                    <td className="py-2">
                      {render_data_flag
                        ? render_scan_step_out.alive_addr_count
                        : ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">New Alive address</td>
                    <td className="py-2">
                      {render_data_flag
                        ? render_scan_step_out.alive_addr_diff_list.map(
                            (alive_addr) => <p key={alive_addr}>{alive_addr}</p>
                          )
                        : ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Dead address number</td>
                    <td className="py-2">
                      {render_data_flag
                        ? render_scan_step_out.dead_addr_count
                        : ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">New Dead address</td>
                    <td className="py-2">
                      {render_data_flag
                        ? render_scan_step_out.dead_addr_diff_list.map(
                            (dead_addr) => <p key={dead_addr}>{dead_addr}</p>
                          )
                        : ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Average RRT</td>
                    <td className="py-2">
                      {render_data_flag
                        ? render_scan_step_out.avg_rrt + "ms"
                        : ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Average RRT change</td>
                    <td className="py-2">
                      {render_data_flag
                        ? render_scan_step_out.avg_rrt_diff + "ms"
                        : ""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class ScanControl extends React.Component {
  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5 block">Operation</label>
        </div>
        <div className="block">
          <button
            className="button is-info"
            name="restart_button"
            onClick={this.props.handle_click}
          >
            Rescan
          </button>
          <button
            className="button is-danger ml-4"
            name="stop_back_button"
            onClick={this.props.handle_click}
          >
            Stop & Back
          </button>
        </div>
      </div>
    );
  }
}

class ScanPainter extends React.Component {
  constructor(props) {
    super(props);
    this.gen_render_step_list = this.gen_render_step_list.bind(this);
  }

  gen_render_step_list(scanner) {
    let start_step =
      this.props.latest_scan_step[scanner] > this.props.max_render_step - 1
        ? this.props.latest_scan_step[scanner]
        : this.props.max_render_step - 1;
    let render_step_list = [];
    for (let ix = 0; ix < this.props.max_render_step; ix++) {
      render_step_list.push(start_step - ix);
    }
    return render_step_list;
  }

  render() {
    if (this.props.ui_mode == "painter") {
      return (
        <div className="container">
          <div className="block pt-5">
            <ScannerCanvas
              handle_click={this.props.handle_click}
              scan_out={this.props.scan_out}
              render_scanner={this.props.render_scanner}
              scanner_running_map={this.props.scanner_running_map}
              highlight_dead_addr_diff={this.props.highlight_dead_addr_diff}
              highlight_avg_rrt_diff={this.props.highlight_avg_rrt_diff}
              gen_render_step_list={this.gen_render_step_list}
            />
          </div>
          <div className="block pt-5">
            <ScanOutCanvas
              handle_click={this.props.handle_click}
              scan_out={this.props.scan_out}
              render_scanner={this.props.render_scanner}
              render_prefix={this.props.render_prefix}
              render_step={this.props.render_step}
              highlight_dead_addr_diff={this.props.highlight_dead_addr_diff}
              highlight_avg_rrt_diff={this.props.highlight_avg_rrt_diff}
              gen_render_step_list={this.gen_render_step_list}
            />
          </div>
          <div className="block pt-5">
            <ScanOutDetailCanvas
              scan_out={this.props.scan_out}
              render_scanner={this.props.render_scanner}
              render_prefix={this.props.render_prefix}
              render_step={this.props.render_step}
            />
          </div>
          <div className="block pt-5">
            <RenderControl
              handle_change={this.props.handle_change}
              max_render_step={this.props.max_render_step}
              highlight_dead_addr_diff={this.props.highlight_dead_addr_diff}
              highlight_avg_rrt_diff={this.props.highlight_avg_rrt_diff}
            />
          </div>
          <div className="block pt-5">
            <ScanControl handle_click={this.props.handle_click} />
          </div>
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}

class GlobalScan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      agent_list: [],
      ws_protocol: "wss",
      scanner_list_input: [],
      prefix_list_input: [],
      repeat_input: 10,
      interval_input: 60,
      scanner_list: [],
      prefix_list: [],
      repeat: 10,
      interval: 60,
      task_id: "",
      task_arg_validity_map: {
        prefix_list: true,
        scanner_list: true,
        repeat: true,
        interval: true,
      },
      scan_out: {},
      latest_scan_step: {},
      render_scanner: "",
      render_prefix: "",
      render_step: "",
      scanner_running_map: {},
      max_render_step: 6,
      highlight_dead_addr_diff: 4,
      highlight_avg_rrt_diff: 10,
      ws: null,
      ui_mode: "creator",
    };

    this.handle_change = this.handle_change.bind(this);
    this.handle_click = this.handle_click.bind(this);
  }

  handle_change(event) {
    switch (event.target.name) {
      case "scanner_list_input":
        this.setState({
          scanner_list_input: event.target.value.split("\n"),
          task_arg_validity_map: this.state.task_arg_validity_map.scanner_list
            ? this.state.task_arg_validity_map
            : { ...this.state.task_arg_validity_map, scanner_list: true },
        });
        break;
      case "prefix_list_input":
        this.setState({
          prefix_list_input: event.target.value.split("\n"),
          task_arg_validity_map: this.state.task_arg_validity_map.prefix_list
            ? this.state.task_arg_validity_map
            : { ...this.state.task_arg_validity_map, prefix_list: true },
        });
        break;
      case "repeat_input":
        this.setState({
          repeat_input: event.target.value,
          task_arg_validity_map: this.state.task_arg_validity_map.repeat
            ? this.state.task_arg_validity_map
            : { ...this.state.task_arg_validity_map, repeat: true },
        });
        break;
      case "interval_input":
        this.setState({
          interval_input: event.target.value,
          task_arg_validity_map: this.state.task_arg_validity_map.interval
            ? this.state.task_arg_validity_map
            : { ...this.state.task_arg_validity_map, interval: true },
        });
        break;
      case "max_render_step_input":
        this.setState({ max_render_step: event.target.value });
        break;
      case "highlight_dead_addr_diff_input":
        this.setState({ highlight_dead_addr_diff: event.target.value });
        break;
      case "highlight_avg_rrt_diff_input":
        this.setState({ highlight_avg_rrt_diff: event.target.value });
        break;
    }
  }

  handle_click(event) {
    switch (event.currentTarget.getAttribute("name")) {
      case "start_button":
        this.scan_task();
        break;
      case "restart_button":
        if (this.state.ws) {
          this.state.ws.close();
        }
        this.scan_task();
        break;
      case "stop_back_button":
        if (this.state.ws) {
          this.state.ws.close();
        }
        this.setState({
          ui_mode: "creator",
        });
        break;
      case "render_scanner_button":
        this.setState({
          render_scanner: event.currentTarget.dataset.scanner,
          render_prefix: "",
          render_step: "",
        });
        break;
      case "render_prefix_step_button":
        this.setState({
          render_prefix: event.currentTarget.dataset.prefix,
          render_step: event.currentTarget.dataset.step,
        });
        break;
    }
  }

  async componentDidMount() {
    if (window.location.protocol == "http:") {
      this.setState({ ws_protocol: "ws" });
    }
    try {
      let response = await fetch("/api/v1/agent_list");
      let json_response = await response.json();
      this.setState({
        agent_list: json_response,
        scanner_list_input: json_response.sort().map((scanner) => "# " + scanner),
      });
    } catch (error) {
      this.setState({ agent_list: [] });
    }
  }

  proc_scanner_step_out(scanner_step_out) {
    // console.log(scanner_step_out);
    let scanner = scanner_step_out.scanner;
    let step_id = scanner_step_out.step_id;
    let scan_step_out = scanner_step_out.scan_step_out;
    if (step_id == 0) {
      this.setState({ scan_out: { [scanner]: [scan_step_out] } });
    } else {
      this.setState({
        scan_out: {
          ...this.state.scan_out,
          [scanner]: [...this.state.scan_out[scanner], scan_step_out],
        },
      });
    }
  }

  scan_task() {
    let task_info = {
      scanner_list: this.state.scanner_list_input.map((scanner) => scanner.trim()),
      prefix_list: this.state.prefix_list_input,
      repeat: Number(this.state.repeat_input),
      interval: Number(this.state.interval_input),
    };
    let ws = new WebSocket(
      this.state.ws_protocol + "://" + window.location.host + "/ws/v1/task"
    );
    // console.log(task_info);
    ws.addEventListener("open", () =>
      ws.send(
        JSON.stringify({
          event: "task_request",
          ...task_info,
        })
      )
    );
    ws.addEventListener("message", (event) => {
      // console.log(event.data);
      let message = JSON.parse(event.data);
      switch (message.event) {
        case "task_start":
          this.setState({
            scanner_list: message.scanner_list,
            prefix_list: message.prefix_list,
            repeat: message.repeat,
            interval: message.interval,
            task_id: message.task_id,
            scan_out: Object.fromEntries(
              message.scanner_list.map((scanner) => [
                scanner,
                Object.fromEntries(
                  message.prefix_list.map((prefix) => [prefix, []])
                ),
              ])
            ),
            latest_scan_step: Object.fromEntries(
              message.scanner_list.map((scanner) => [scanner, 0])
            ),
            render_scanner: message.scanner_list[0],
            render_prefix: "",
            render_step: "",
            scanner_running_map: Object.fromEntries(
              message.scanner_list.map((scanner) => [scanner, false])
            ),
            ws: ws,
            ui_mode: "painter",
          });
          break;
        case "task_arg_error":
          this.setState({
            task_arg_validity_map: message.task_arg_validity_map,
          });
          break;
        case "scanner_start":
          this.setState({
            scanner_running_map: {
              ...this.state.scanner_running_map,
              [message.scanner]: true,
            },
          });
          break;
        case "scanner_end":
          this.setState({
            scanner_running_map: {
              ...this.state.scanner_running_map,
              [message.scanner]: false,
            },
          });
          break;
        case "step_end":
          this.setState({
            scan_out: {
              ...this.state.scan_out,
              [message.scanner]: {
                ...this.state.scan_out[message.scanner],
                [message.prefix]: [
                  ...this.state.scan_out[message.scanner][message.prefix],
                  {
                    step: message.step,
                    alive_addr_count: message.alive_addr_count,
                    dead_addr_count: message.dead_addr_count,
                    avg_rrt: message.avg_rrt,
                    alive_addr_diff_list: message.alive_addr_diff_list,
                    dead_addr_diff_list: message.dead_addr_diff_list,
                    avg_rrt_diff: message.avg_rrt_diff,
                  },
                ],
              },
            },
            latest_scan_step: {
              ...this.state.latest_scan_step,
              [message.scanner]:
                message.step > this.state.latest_scan_step[message.scanner]
                  ? message.step
                  : this.state.latest_scan_step[message.scanner],
            },
          });
          break;
      }
    });
  }

  render() {
    return (
      <div className="block">
        <ScanCreator
          handle_change={this.handle_change}
          handle_click={this.handle_click}
          scanner_list_input={this.state.scanner_list_input}
          prefix_list_input={this.state.prefix_list_input}
          repeat_input={this.state.repeat_input}
          interval_input={this.state.interval_input}
          agent_list={this.state.agent_list}
          task_arg_validity_map={this.state.task_arg_validity_map}
          ui_mode={this.state.ui_mode}
        />
        <ScanPainter
          handle_change={this.handle_change}
          handle_click={this.handle_click}
          scan_out={this.state.scan_out}
          latest_scan_step={this.state.latest_scan_step}
          render_scanner={this.state.render_scanner}
          render_prefix={this.state.render_prefix}
          render_step={this.state.render_step}
          scanner_running_map={this.state.scanner_running_map}
          max_render_step={this.state.max_render_step}
          highlight_dead_addr_diff={this.state.highlight_dead_addr_diff}
          highlight_avg_rrt_diff={this.state.highlight_avg_rrt_diff}
          ui_mode={this.state.ui_mode}
        />
      </div>
    );
  }
}

ReactDOM.render(<GlobalScan />, document.querySelector("#global_scan_root"));
