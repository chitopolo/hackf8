import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Home from './Home';
import About from './About';
import Topics from './Topics';
import RouteCreator from './RouteCreator';
import Routes from './Routes';
import Signup from './Signup';
import RouteView from './Route';
import { BrowserRouter, Route, Link } from 'react-router-dom'
import {firebaseDb, firebaseAuth, firebaseStorage} from './../dist/static/js/firebase';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {LinkContainer} from 'react-router-bootstrap'
import {Navbar, Nav, MenuItem, NavItem, Grid, Image} from 'react-bootstrap'

class Menu extends Component {
  constructor(props){
    super(props)
    this.state = {
      userId:'',
      userSavedData:''
    }
  }
  componentWillMount(){
      var that = this
     var user = firebaseAuth.onAuthStateChanged(function(user) {
       if (user) {
         console.log(user.uid)
         var userSavedData = firebaseDb.ref('users/'+user.uid)
       
        userSavedData.on('value', function(value){
        console.log('userSavedData: ', value.val())
          
            that.setState({
                userSavedData: value.val(),
                userId: user.uid,
            })
        })
       } 
     });
  }
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
     <LinkContainer to="/route/create">
        <NavItem eventKey={2} >Creador de Rutas</NavItem>
    </LinkContainer>
    <LinkContainer to="/routes">
        <NavItem eventKey={3} >Rutas</NavItem>
    </LinkContainer>
     <LinkContainer to="/topics">
        <NavItem eventKey={4} >Topics</NavItem>
    </LinkContainer>



      </Nav>
      <Nav pullRight>
      <LinkContainer to="/signup">
        <NavItem eventKey={1} > <span><Image circle  style={{height:'25px'}} src={this.state.userSavedData.avatar}/></span>  {this.state.userSavedData.displayName || "Login"}</NavItem>
    </LinkContainer>

    <LinkContainer to="/">
        <NavItem eventKey={2} >?</NavItem>
    </LinkContainer>
      </Nav>
    </Navbar.Collapse>
  </Navbar>



        <Route exact path="/" component={Home}/>

        <Route path="/signup" component={Signup}/>
        <Route path="/about" component={About}/>
        <Route path="/route/create" component={RouteCreator}/>
        <Route path="/routes" component={Routes}/>
        <Route path="/route/:key" component={RouteView}/>
        <Route path="/topics" component={Topics}/>
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