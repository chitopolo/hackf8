import React from 'react';
import {firebaseDb, firebaseAuth, firebaseStorage} from './../dist/static/js/firebase';
import { Button, Grid, Row, Col, ControlLabel } from 'react-bootstrap'
import Notifications, {notify} from 'react-notify-toast';
import firebase from 'firebase'
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
      uid:null
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

    return (
      <div>

      {console.log('userId: ',this.state.userId)}

        {(this.state.userId)? <Grid>
          
          <h2>{this.state.userSavedData.displayName}</h2>



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

