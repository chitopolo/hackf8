import React from 'react';
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


export default class Rides extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
    	routes:[{id:'na', name:'na'}],
    	start: new Date(),
    	end:  new Date(), 
    	meetingTime:  new Date(),
    	cost:'',
    	recomendations:''
    }
  }
  componentWillMount(){
  	var routesList = []

  	firebaseDb.ref('routes').on('child_added', function(snapshot){
  		console.log('route:', snapshot.val())
  		routesList.push({ id: snapshot.key,  name: snapshot.val().title})
  		this.setState({
  			routes:routesList
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

  render() {
    return (
      <Grid>
      	<h3>Administrador de Salidas</h3>
      	<Col md={4}>
      	<ControlLabel>Ruta</ControlLabel>
      		<Combobox
      		    data={this.state.routes}
      		    valueField='id'
      		    textField='name'
      		    defaultValue={'Seleccione su ruta'}
      		  />
      		  </Col>
      		  <Col md={4}>
      		  		<ControlLabel>Recomendaciones</ControlLabel>
        				<input name="recomendations" value={this.state.recomendations} onChange={this.handleInputChange}  className="form-control" type="text" />
      		  </Col>

      		  <Col md={4}>
      		  		<ControlLabel>Costo</ControlLabel>
        				<input name="cost" value={this.state.cost} onChange={this.handleInputChange}  className="form-control" type="text" />
      		  </Col>

      		  <Col md={3}>
      		  	<ControlLabel>Fecha de salida</ControlLabel>

		      	<DateTimePicker
		      	  value={this.state.meetingTime}
		      	  defaultValue={new Date()}
		      	  time={false}
		      	  onChange={meetingTime => this.setState({ meetingTime })}
		      	/>


      		  </Col>


      		  <Col md={3}>
      		  	<ControlLabel>Horario en punto de encuentro</ControlLabel>

		      	<DateTimePicker
		      	  value={this.state.meetingTime}
		      	  defaultValue={new Date()}
		      	  date={false}
		      	  onChange={meetingTime => this.setState({ meetingTime })}
		      	/>


      		  </Col>

      		  <Col md={3}>
      		  	<ControlLabel>Horario de salida</ControlLabel>
		      	<DateTimePicker
		      	  value={this.state.start}
		      	  defaultValue={new Date()}
		      	  date={false}
		      	  onChange={start => this.setState({ start })}
		      	/>
      		  </Col>

      		    <Col md={3}>
      		  	<ControlLabel>Horario de Regreso</ControlLabel>
		      	<DateTimePicker
		      	  value={this.state.end}
		      	  defaultValue={new Date()}
		      	  date={false}
		      	  onChange={end => this.setState({ end })}
		      	/>
      		  </Col>


      </Grid>
    );
  }
}
