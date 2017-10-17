
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Table, Button, Row, Col, Grid, ControlLabel, FormGroup, FormControl, Image, Label, Glyphicon } from  'react-bootstrap'
import {firebaseDb, firebaseAuth, firebaseStorage} from './../dist/static/js/firebase';
import _ from 'underscore'
import Dropzone from 'react-dropzone'
import { compose, withProps } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Polyline
} from "react-google-maps";
import {CountryDropdown, RegionDropdown} from 'react-country-region-selector';
import {Link} from 'react-router-dom'
import DrawingManager from "react-google-maps/lib/components/drawing/DrawingManager";
import IntlTelInput from 'react-intl-tel-input';
import './../node_modules/react-intl-tel-input/dist/libphonenumber.js';
import moment from 'moment'



export default class RoutesList extends Component {
	constructor(props){
		super(props)
		this.state = {
			routes:{},
			country:'',
			state:'',
			filteredRoutes:{}
		}
	}
	componentWillMount(){
		var routes = firebaseDb.ref('routes')
		routes.on('value', function(snapshot){
			this.setState({
				routes:snapshot.val()
			})
		}, this)
	}
	 selectCountry = (val) => {
    console.log('val country:', val)
    this.setState({country: val});
  }

  selectRegion = (val)=> {
    this.setState({state: val});
  }
  searchRoutes = () =>{
  	var that = this
  	var routes = firebaseDb.ref('routes')
  	var locations = firebaseDb.ref('locations')
  	var filteredRoutes = []
  	var newObject = {}
  	locations.child(this.state.country).child(this.state.state).on('value', function(snapshot){
  		console.log('snapshot.val(): ', snapshot.val())
  		_.each(snapshot.val(), function(value, key){
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


  }


	render() {
		var eachElement = {
			paddingBottom:'25px',
			paddingTop:'25px',
			borderBottom:'1px solid #ccc'
		}
		return (
			<Grid>

<Row>
			 <Col md={5}>
                <FormGroup> 
                <ControlLabel>País
                </ControlLabel> 
                <CountryDropdown
                value = {
                  this.state.country
                }
                valueType = "full"
                classes = "form-control"
                onChange = {
                  (val) => this.selectCountry(val)
                } /> 
                </FormGroup> 
                </Col>
            <Col md={5}>
                <FormGroup> 
                <ControlLabel>Estado 
                </ControlLabel> 
                
                <RegionDropdown
                countryValueType = "full"
                country = {
                  this.state.country
                }
                value = {
                  this.state.state
                }
                classes = "form-control"
                onChange = {
                  (val) => this.selectRegion(val)
                }/> 
                </FormGroup> 
             </Col>
             <Col md={2}>
               <ControlLabel> 
                </ControlLabel> 
                <Button block bsStyle="info" onClick={this.searchRoutes}>Buscar</Button></Col>
</Row>


						{ (Object.keys(this.state.filteredRoutes).length > 0) ? <div>{_.map(this.state.filteredRoutes, function(value, key){
							console.log('value: ', value , " key: ", key)
							return <div key={key} style={eachElement}>
					<Row>
						<Col md={3}>
						{ value.image ? <Image src={value.image} responsive thumbnail/> :  <Image src="./../static/img/bicirutabw.png" responsive />}
						</Col>

						<Col md={9}>
							<Row>
								<Col md={8}>
									<h2>{value.title}</h2>
								</Col>
								<Col md={4} style={{fontSize:'1.2em'}}>
								<br/>
									 {value.distance && <span><b>Distancia:</b> {value.distance}</span>}  {value.difficulty && <span><b>Dificultad:</b> {value.difficulty}</span>}
								</Col>
							</Row>
							<Row>
							<Col md={9}>
									<p>{value.description.substring(0,400)+'...'}</p>
							</Col>
							<Col md={3}>
								<Link to={'/route/'+key}><Button block bsSize="xsmall" bsStyle="info">Ver</Button></Link>
								<Link to={'/route/'+key}><Button block  bsSize="xsmall" bsStyle="warning">editar</Button></Link>
								<Link to={'/route/'+key}><Button block bsSize="xsmall" bsStyle="danger">deshabilitar</Button></Link>
							</Col>
							</Row>
						</Col>
						
						</Row>
						</div>
						})}</div>:<h1>Escoge una ciudad para ver las rutas disponibles</h1>}
						
				
			</Grid>
		);
	}
}

const AnyReactComponent = ({ text }) => <div>{text}</div>;

class SimpleMap extends Component {
  static defaultProps = {
    center: {lat: 59.95, lng: 30.33},
    zoom: 11
  };

  render() {
    return (
      <GoogleMapReact
        defaultCenter={this.props.center}
        defaultZoom={this.props.zoom}
      >
        <AnyReactComponent
          lat={59.955413}
          lng={30.337844}
          text={'Kreyser Avrora'}
        />
      </GoogleMapReact>
    );
  }
}