import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Home from './Home';
import About from './About';
import Topics from './Topics';
import Routes from './Routes';
import RouteView from './Route';
import { BrowserRouter, Route, Link } from 'react-router-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {LinkContainer} from 'react-router-bootstrap'
import {Navbar, Nav, MenuItem, NavItem, Grid, Image} from 'react-bootstrap'

class Menu extends Component {
  render () {
    return (
      <div>
      <Navbar inverse collapseOnSelect>
    <Navbar.Header>
      <Navbar.Brand>
      <a>
        Biciruta</a>
      </Navbar.Brand>
      <Navbar.Toggle />
    </Navbar.Header>
    <Navbar.Collapse>
      <Nav>

    <LinkContainer to="/">
        <NavItem eventKey={1} >Home</NavItem>
    </LinkContainer>
     <LinkContainer to="/routes">
        <NavItem eventKey={2} >Rutas</NavItem>
    </LinkContainer>
     <LinkContainer to="/topics">
        <NavItem eventKey={3} >Topics</NavItem>
    </LinkContainer>



      </Nav>
      <Nav pullRight>
      <LinkContainer to="/">
        <NavItem eventKey={1} >Login</NavItem>
    </LinkContainer>

    <LinkContainer to="/">
        <NavItem eventKey={2} >?</NavItem>
    </LinkContainer>
      </Nav>
    </Navbar.Collapse>
  </Navbar>



        <Route exact path="/" component={Home}/>
<Grid>

        <Route path="/about" component={About}/>
        <Route path="/routes" component={Routes}/>
        <Route path="/route/:key" component={RouteView}/>
        <Route path="/topics" component={Topics}/>
        </Grid>
      </div>
    )
  }
}


const MiPrimerComponente = () => {
  return (
    <BrowserRouter>
      <div>
        <Menu/>
       
      </div>
    </BrowserRouter>
  );
};

ReactDOM.render(<MiPrimerComponente />, document.getElementById('main'));



if(module.hot){
  module.hot.accept()

  // module.hot.dispose(function(){
  //   // window.location.reload();
  // })
}