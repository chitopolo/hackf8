import React from 'react';
import {firebaseDb, firebaseAuth, firebaseStorage} from './../dist/static/js/firebase';
import { Button, Grid, Row, Col, ControlLabel, Image } from 'react-bootstrap'
import Notifications, {notify} from 'react-notify-toast';
import firebase from 'firebase'
import _ from 'underscore'

import {Link} from 'react-router-dom'

function userExistsCallback(userId, exists) {
  if (exists) {
    alert('user ' + userId + ' exists!');
  } else {
    alert('user ' + userId + ' does not exist!');
  }
}





export default class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.sendCredential  = this.sendCredential.bind(this)
    this.state = {
      user:'',
      password:'',
      uid:null,
      filteredRoutes:{},
      filteredRides:{},
      routes:{},
      userId:'',
      rides:{}
    }
  }
   componentWillMount(){
      var that = this
  var routes = firebaseDb.ref('routes')
              routes.on('value', function(snapshot){
                that.setState({
                  routes:snapshot.val()
                })
              })

              var rides = firebaseDb.ref('rides')
              rides.on('value', function(snapshot){
                that.setState({
                  rides:snapshot.val()
                })
              })


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
              var filteredRoutes = []
              var newObject = {}
              var userSavedData = firebaseDb.ref('users/'+user.uid)
              userSavedData.child('routes').on('value', function(snapshot){
                console.log('snapshot.val routes (): ', snapshot.val())
                _.each(snapshot.val(), function(value, key){
                    console.log('routes[key]: ', that.state.routes,that.state.routes[key], value, key)

                  if(that.state.routes[key]){
                    
                    console.log('routes[key]: ', that.state.routes[key])
                    newObject[key]= that.state.routes[key]
                    console.log('adding newObject: ', newObject)
                    that.setState({
                      filteredRoutes:newObject
                    })    
                  }
                })

              })
              var filteredRides= []
              var newObjectRides = {}
               userSavedData.child('rides').on('value', function(snapshot){
                console.log('snapshot.val rides(): ', snapshot.val())
                _.each(snapshot.val(), function(value, key){
                    console.log('rides[key]: ', that.state.rides ,that.state.rides[key], value, key)

                  if(that.state.rides[key]){
                    
                    console.log('rides[key]: ', that.state.rides[key])
                    newObjectRides[key]= that.state.rides[key]
                    console.log('adding newObjectRides: ', newObjectRides)
                    that.setState({
                      filteredRides:newObjectRides
                    })    
                  }
                })
              })
        })
       } 
     });




  }
  componentDidMount(){

  }
  
  sendCredential(provider){
   firebaseAuth.signInWithPopup(provider).then(function(result) {
      var token = result.credential.accessToken;
      var user = result.user;
      console.log("user:", user)
      var userChunk = {
        uid:user.uid,
        email:user.email,
        displayName: user.displayName,
        avatar:user.providerData[0].photoURL,
        permissions:50
      }
      var newUser = firebaseDb.ref('users')
      newUser.child(user.uid).once('value', function(snapshot) {
        var exists = (snapshot.val() !== null);
        if(!exists){
          newUser.child(user.uid).set(userChunk)
        }else{
           newUser.child(user.uid).update({email:userChunk.email, displayName:userChunk.displayName, avatar:userChunk.avatar})
        }
      });
    notify.show("Bienvenid@ "+ user.displayName , "success");
    }).catch(function(error) {
        console.error(error)
    });
  }


  signInWithEmail = () => {
    firebaseAuth.signInWithEmailAndPassword(this.state.email, this.state.password).then(function(response){
        console.log('Response: ', response)
       var newUser = firebaseDb.ref('users')
      firebaseAuth.onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
        notify.show('Bienvenido '+ user.displayName, 'success')
          var userChunk = {
              uid:user.uid,
              email:user.email,
              displayName: user.displayName,
              avatar:user.providerData[0].photoURL,
              permissions:50
            }
             newUser.child(user.uid).once('value', function(snapshot) {
        var exists = (snapshot.val() !== null);
        if(!exists){
         
          newUser.child(user.uid).set(userChunk)

        }else{
           notify.show('Bienvenido '+ user.displayName, 'success')
           newUser.child(user.uid).update({email:userChunk.email, displayName:userChunk.displayName})
        }
      });

        } else {
          // No user is signed in.
          notify.show('sesión inexistente', 'error')
        }
      });

    }).catch(function(error) {
      console.log('error: ', error)
      // Handle Errors here.
      notify.show(error.message, "error");  

      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
    });
  }
  createEmailAccount = () => {
    firebaseAuth.createUserWithEmailAndPassword(this.state.email, this.state.password).catch(function(error) {
      // Handle Errors here.
       notify.show(error.message, "error");  
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
    });
  }

   handleInputChange=(event)=>{
    const target = event.target;
    const value =  target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }


  render() {
   var FbCredential = new firebase.auth.FacebookAuthProvider()
       FbCredential.addScope('user_birthday');
   var GithubProvider = new firebase.auth.GithubAuthProvider();
    GithubProvider.addScope('repo');
    var eachElement = {
      borderBottom:'1px solid #ccc'
    }
var that = this

    return (
      <div>

      {console.log('userId: ',this.state.userId)}

        {(this.state.userId)? <Grid>
          
          <Row>
            <Col md={2}><Image src={this.state.userSavedData.avatar} responsive thumbnail/></Col>
            <Col md={10}><h2> {this.state.userSavedData.displayName}</h2></Col>
          </Row>
          <Row>
          <Col md={6}>
             {(Object.keys(this.state.filteredRoutes).length> 0) ? <h3>Rutas creadas</h3>: null}

            { (Object.keys(this.state.filteredRoutes).length > 0) ? <div>{_.map(this.state.filteredRoutes, function(value, key){
              console.log('value: ', value , " key: ", key)
              return <div key={key} style={eachElement}>
          <Row>
            <Col md={2}>
            { value.image ? <Image src={value.image} responsive thumbnail/> :  <Image src="./../static/img/bicirutabw.png" responsive />}
            </Col>

            <Col md={10}>
              <Row>
                <Col md={8}>
                  <h3>{value.title}</h3>
                </Col>
                <Col md={4} style={{fontSize:'1.2em'}}>
                <br/>
                   {value.distance && <span><b>Distancia:</b> {value.distance}</span>}  {value.difficulty && <span><b>Dificultad:</b> {value.difficulty}</span>}
                </Col>
              </Row>
              <Row>
              <Col md={9}>
                  <p>{value.description.substring(0,140)+'...'}</p>
              </Col>
              <Col md={3}>
                <Link to={'/route/'+key}><Button block bsSize="xsmall" bsStyle="primary">Ver</Button></Link>
              </Col>
              </Row>
            </Col>
            
            </Row>
            </div>
            })}</div>:null}
            </Col>
            <Col md={6}>
            {(Object.keys(this.state.filteredRides).length> 0) ? <h3>Salidas creadas</h3>: null}

            { (Object.keys(this.state.filteredRides).length > 0) ? <div>{_.map(this.state.filteredRides, function(value, key){
              console.log('value: ', value , " key: ", key)
              return <div key={key} style={eachElement}>
          <Row>
            <Col md={12}>
              <Row>
                <Col md={8}>
                  {console.log('routes: ', that.state.routes, ' value: ', value.route.id)}
                  {(that.state.routes[value.route.id]) ? <h3>{that.state.routes[value.route.id].title}</h3>:<h3>nada</h3>}
                </Col>
                <Col md={4} style={{fontSize:'1.2em'}}>
                <br/>
                   {value.meetingTime && <span><b>Encuentro:</b> {value.meetingTime}</span>}  {value.start && <span><b>Salida:</b> {value.start}</span>} {value.end && <span><b>Retorno:</b> {value.end}</span>}
                </Col>
              </Row>
              <Row>
              <Col md={9}>
                  <p>{value.recomendations.substring(0,140)+'...'}</p>
              </Col>
              <Col md={3}>
                <Link to={'/route/'+key}><Button block bsSize="xsmall" bsStyle="primary">Ver</Button></Link>
              </Col>
              </Row>
            </Col>
            
            </Row>
            </div>
            })}</div>:null}
            </Col>
          </Row>


        </Grid>: <Grid>
          <Row>
            
          <Col md={6} mdOffset={3}>
          <Row>
          <Col md={12}>
          <ControlLabel>Email</ControlLabel>
            <input className="form-control " type="text" name="email" value={this.state.email} onChange={this.handleInputChange} />
          </Col>
          <Col md={12}>
          <ControlLabel>Password</ControlLabel>
            <input className="form-control " type="text" name="password" type="password" value={this.state.password} onChange={this.handleInputChange} />
          </Col>
          <Col md={12}>
          <ControlLabel>  </ControlLabel>
              <Button bsStyle="primary" block onClick={this.createEmailAccount}>Crear cuenta</Button>          
              <Button bsStyle="primary" block onClick={this.signInWithEmail}>Iniciar sesión</Button>   
                <Button onClick={this.sendCredential.bind(this, FbCredential)} bsStyle="info" block>Inicia sesión con Facebook</Button>       
          </Col>          
          </Row>
          </Col>
         
          </Row>
        </Grid>}




        
      </div>
    );
  }
}

