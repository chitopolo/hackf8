import React, { Component } from 'react';
import {firebaseDb, firebaseAuth, firebaseStorage} from './../dist/static/js/firebase';
import {Table, Button, Row, Col, Grid, ControlLabel, FormGroup, FormControl, Image} from  'react-bootstrap'

import Notifications, {notify} from 'react-notify-toast';
import firebase from 'firebase'
import _ from 'underscore'
import Combobox from 'react-widgets/lib/Combobox';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import Moment from 'moment'
import momentLocalizer from 'react-widgets-moment';

Moment.locale('es')
momentLocalizer()


export default class Rides extends Component {
  constructor(props) {
    super(props);
    this.state ={
    	routes:[{id:'na', name:'na'}],
    	start: new Date(),
    	end:  new Date(), 
    	meetingTime:  new Date(),
    	cost:'',
    	recomendations:'',
    	rides:{},
    	selectedRoute:'',
    	userSavedData:'',
    	userId:'',
    	active:false,
    	createdBy:''
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



  	var routesList = []

  	firebaseDb.ref('routes').on('child_added', function(snapshot){
  		console.log('route:', snapshot.val())
  		routesList.push({ id: snapshot.key,  name: snapshot.val().title})
  		this.setState({
  			routes:routesList
  		})
  	}, this)
  	var rides = firebaseDb.ref('rides')
  	rides.on('value', function(snapshot){
  		this.setState({
  			rides:snapshot.val()
  		})
  	}, this)
  }


  handleInputChange=(event)=>{
    const target = event.target;
    const value =  target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }
  saveRide =()=>{
  	var rides = firebaseDb.ref('rides')
  	var userData = firebaseDb.ref('users/'+this.state.userId)
  	var dataToSave = {
  		route:this.state.selectedRoute,
  		meetingTime:Moment(this.state.meetingTime).format('LT'),
  		start:Moment(this.state.start).format('LT'),
  		end:Moment(this.state.end).format('LT'),
  		date:Moment(this.state.date).format(),
  		cost:this.state.cost,
  		recomendations:this.state.recomendations,
  		createdBy:this.state.userId

  	}
  	console.log(dataToSave)
  	var savedRide =	rides.push(dataToSave)
  	userData.child('rides').child(savedRide.key).set(true)

  }

  render() {
    return (
      <Grid>
      	<h3>Administrador de Salidas</h3>
      	<Row>
      	<Col md={5}>
      	<ControlLabel>Ruta</ControlLabel>
      		<Combobox
      		    data={this.state.routes}
      		    valueField='id'
      		    textField='name'
      		    onChange={selectedRoute => this.setState({ selectedRoute })}
      		    defaultValue={'Seleccione su ruta'}
      		  />
      		  </Col>
      		  <Col md={5}>
      		  		<ControlLabel>Recomendaciones</ControlLabel>
        				<input name="recomendations" value={this.state.recomendations} onChange={this.handleInputChange}  className="form-control" type="text" />
      		  </Col>

      		  <Col md={2}>
      		  		<ControlLabel>Costo</ControlLabel>
        				<input name="cost" value={this.state.cost} onChange={this.handleInputChange}  className="form-control" type="text" />
      		  </Col>

      		  <Col md={3}>
      		  	<ControlLabel>Fecha de salida</ControlLabel>

		      	<DateTimePicker
		      	  value={this.state.date}
		      	  defaultValue={new Date()}
		      	  time={false}
		      	  onChange={meetingTime => this.setState({ meetingTime })}
		      	/>


      		  </Col>


      		  <Col md={2}>
      		  	<ControlLabel>Punto de encuentro</ControlLabel>

		      	<DateTimePicker
		      	  value={this.state.meetingTime}
		      	  defaultValue={new Date()}
		      	  date={false}
		      	  onChange={meetingTime => this.setState({ meetingTime })}
		      	/>


      		  </Col>

      		  <Col md={2}>
      		  	<ControlLabel>Salida</ControlLabel>
		      	<DateTimePicker
		      	  value={this.state.start}
		      	  defaultValue={new Date()}
		      	  date={false}
		      	  onChange={start => this.setState({ start })}
		      	/>
      		  </Col>

      		    <Col md={3}>
      		  	<ControlLabel>Regreso</ControlLabel>
		      	<DateTimePicker
		      	  value={this.state.end}
		      	  defaultValue={new Date()}
		      	  date={false}
		      	  onChange={end => this.setState({ end })}
		      	/>
      		  </Col>

      		  <Col md={2}>
      		  	<ControlLabel> </ControlLabel>
		      	<Button bsStyle="primary" block onClick={this.saveRide}>Guardar</Button>
      		  </Col>

      		  </Row>
      		  	<RidesList ridesData = {this.state.rides}/>
      </Grid>
    );
  }
}



class RidesList extends Component {
	constructor(props){
		super(props)
		this.state = {
			rides:{},
			routes:{},
			users:{}
		}
	}
	componentWillMount(){
		firebaseDb.ref('rides').on('value', function(snapshot){
			this.setState({
				rides:snapshot.val()
			})
		}, this)
		firebaseDb.ref('routes').on('value', function(snapshot){
			this.setState({
				routes:snapshot.val()
			})
		}, this)
		firebaseDb.ref('users').on('value', function(snapshot){
			this.setState({
				users:snapshot.val()
			})
		}, this)
	}
	render() {
		var that = this
		return (
			<div>
				<h3>Lista de salidas</h3>
				{(Object.keys(this.state.rides).length > 0) ? 
					<div>
					<Table>
							<thead>
						      <tr>
						        <th>Ruta</th>
						        <th>Recomendaciones</th>
						        <th>Costo</th>
						        <th>Fecha de salida</th>
						        <th>Punto de encuentro</th>
						        <th>Salida</th>
						        <th>Regreso aproximado</th>
						        <th>Creado por</th>
					          </tr>
					        </thead>
					        <tbody>

					{_.map(this.state.rides, function(value, key){
						return <tr key={key}>
					        {(that.state.routes[value.route.id]) ? <td>{that.state.routes[value.route.id].title}</td>: <td></td>}
					        <td>{value.recomendations}</td>
					        <td>{value.cost}</td>
					        <td>{Moment(value.date).format('LLLL')}</td>
					        <td>{value.meetingTime}</td>
					        <td>{value.start}</td>
					        <td>{value.end}</td>
					        {console.log('value.createdBy: ', value.createdBy)}
					        {(Object.keys(that.state.users).length && value.createdBy) ? <td>{that.state.users[value.createdBy].displayName || ''}</td>: <td></td>}
    				    </tr>
					})}
					        </tbody>
						</Table>
					</div>: <div></div>}

			</div>
		);
	}
}

