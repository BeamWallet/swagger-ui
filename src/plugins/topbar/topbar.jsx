import React from "react"
import PropTypes from "prop-types"

//import "./topbar.less"
import Logo from "./logo_small.png"
import {Select} from "../../core/components/layout-utils";

export default class Topbar extends React.Component {

  static propTypes = {
    layoutActions: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    this.state = { url: props.specSelectors.url(), email: '', password: '', site: 'https://portal.api.dev.beamwallet.com', jwtToken: props.specSelectors.jwtToken(), selectedIndex: 0 }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ url: nextProps.specSelectors.url(), jwtToken: nextProps.specSelectors.jwtToken() })
  }

  onUrlChange =(e)=> {
    let {target: {value}} = e
    this.setState({url: value})
  }

  onEmailChange =(e)=> {
    let {target: {value}} = e
    this.setState({email: value})
  }

  onPasswordChange =(e)=> {
    let {target: {value}} = e
    this.setState({password: value})
  }

  onSiteChange =(e)=> {
    let {target: {value}} = e
    this.setState({site: value})
  }

  loadSpec = (url) => {
    this.props.specActions.updateUrl(url)
    this.props.specActions.download(url)
  }

  onUrlSelect =(e)=> {
    let url = e.target.value || e.target.href
    this.loadSpec(url)
    this.setSelectedUrl(url)
    e.preventDefault()
  }

  downloadUrl = (e) => {
    this.loadSpec(this.state.url)
    e.preventDefault()
  }

  loginToBeam = (e) => {
    this.props.specActions.beamLogin(this.state.email, this.state.password, this.state.site)
    e.preventDefault()
  }


  setSelectedUrl = (selectedUrl) => {
    const configs = this.props.getConfigs()
    const urls = configs.urls || []

    if(urls && urls.length) {
      if(selectedUrl)
      {
        urls.forEach((spec, i) => {
          if(spec.url === selectedUrl)
            {
              this.setState({selectedIndex: i})
            }
        })
      }
    }
  }

  componentWillMount() {
    const configs = this.props.getConfigs()
    const urls = configs.urls || []

    if(urls && urls.length) {
      let primaryName = configs["urls.primaryName"]
      if(primaryName)
      {
        urls.forEach((spec, i) => {
          if(spec.name === primaryName)
            {
              this.setState({selectedIndex: i})
            }
        })
      }
    }
  }

  componentDidMount() {
    const urls = this.props.getConfigs().urls || []

    if(urls && urls.length) {
      this.loadSpec(urls[this.state.selectedIndex].url)
    }
  }

  onFilterChange =(e) => {
    let {target: {value}} = e
    this.props.layoutActions.updateFilter(value)
  }

  render() {
    let { getComponent, specSelectors, getConfigs } = this.props
    const Button = getComponent("Button")
    const Link = getComponent("Link")

    let isLoading = specSelectors.loadingStatus() === "loading"
    let isFailed = specSelectors.loadingStatus() === "failed"

    let inputStyle = {}
    if(isFailed) inputStyle.color = "red"
    if(isLoading) inputStyle.color = "#aaa"

    const { urls } = getConfigs()
    let control = []
    let formOnSubmit = null

    let loginControl = []
    let getCredentials = null

    let jwtControl = []

    let jwt = specSelectors.jwtToken()

    if(urls) {
      let rows = []
      urls.forEach((link, i) => {
        rows.push(<option key={i} value={link.url}>{link.name}</option>)
      })

      control.push(
        <label className="select-label" htmlFor="select"><span>Select a spec</span>
          <select id="select" disabled={isLoading} onChange={ this.onUrlSelect } value={urls[this.state.selectedIndex].url}>
            {rows}
          </select>
        </label>
      )
    }
    else {
      formOnSubmit = this.downloadUrl

      control.push(<input className="download-url-input" type="text" onChange={ this.onUrlChange } value={this.state.url} disabled={isLoading} style={inputStyle} />)
      control.push(<Button className="download-url-button" onClick={ this.downloadUrl }>Explore</Button>)

      getCredentials = this.loginToBeam
      loginControl.push(" Email Address: ")
      loginControl.push(<input type="text" value={this.state.email} onChange={ this.onEmailChange } name="email" style={inputStyle}/>)
      loginControl.push(" Password: ")
      loginControl.push( <input type="password" value={this.state.password} onChange={ this.onPasswordChange } name="password" style={inputStyle}/>)
      loginControl.push(" Site: ")
      loginControl.push(<select name="site"  value={this.state.site} onChange={ this.onSiteChange }>
        <option value="http://localhost:8080">localhost</option>
        <option value="https://portal.api.dev.beamwallet.com">dev</option>
        <option value="https://portal.api.staging.beamwallet.com">staging</option>
      </select>)
      loginControl.push(<Button className="button" onClick={ this.loginToBeam }>Login</Button>)

      jwtControl.push(" JWT token: ")
      jwtControl.push(<input id="jwtToken" value={this.state.jwtToken} style={inputStyle} disabled/>)
      jwtControl.push(" (Copy JWT token and paste in authorize below) ")

    }

    return (
      <div className="topbar">
        <div className="wrapper">
          <div className="topbar-wrapper">
            <Link href="#" title="Swagger UX">
              <img height="30" width="30" src={ Logo } alt="Swagger UI"/>
              <span>swagger</span>
            </Link>
            <form className="download-url-wrapper" onSubmit={formOnSubmit}>
              {control}
            </form>
          </div>
        </div>
        <div onSubmit={getCredentials}>
          <form >
            {loginControl}
            {jwtControl}
          </form>
        </div>
      </div>
    )
  }
}

Topbar.propTypes = {
  specSelectors: PropTypes.object.isRequired,
  specActions: PropTypes.object.isRequired,
  getComponent: PropTypes.func.isRequired,
  getConfigs: PropTypes.func.isRequired
}
