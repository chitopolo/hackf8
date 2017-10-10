import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Table, Button, Row, Col, Grid, ControlLabel, FormGroup, FormControl, Image} from  'react-bootstrap'
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


var drawPolyline = []

const MapWithADrawingManager = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBdaG4W9-9ETMwF1WZcZxBnkvj6G2PKiL0&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `800px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)(props =>
  <GoogleMap
    defaultZoom={15}
    defaultCenter={new google.maps.LatLng(parseFloat(props.lat), parseFloat(props.lon))}
  >
    <DrawingManager
      defaultDrawingMode={google.maps.drawing.OverlayType.POLYLINE}
      onPolylineComplete={(stuff)=>{
      drawPolyline = stuff.getPath().getArray()
        }}
      defaultOptions={{
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            google.maps.drawing.OverlayType.POLYLINE,
          ],
        },
        circleOptions: {
          fillColor: `#ffff00`,
          fillOpacity: 1,
          strokeWeight: 5,
          clickable: false,
          editable: true,
          zIndex: 1,
        },
      }}
    />
  </GoogleMap>
);



export default class Routes extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
      	
      	<RouteCreator />
        <br/>

      	<RoutesList />
      </div>
    );
  }
}




export class RouteCreator extends Component {
	constructor(props){
		super(props)
		this.state={
			title:'',
			distance:'',
			description:'',
			level:'',
      files:[],
      city:'',
      polyline:[],
      actualLat:0,
      actualLon:0
		}
	}

  handleInputChange=(event)=>{
    const target = event.target;
    const value =  target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }
  

  componentDidMount(){
    var that = this
const getLocation = () => {
const geolocation = navigator.geolocation;

const location = new Promise((resolve, reject) => {
    if (!geolocation) {
    reject(new Error('Not Supported'));
    }
    
    geolocation.getCurrentPosition((position) => {
    resolve(position);
    }, () => {
    reject (new Error('Permission denied'));
    });
});

return location

};

    getLocation().then(function(result){
        console.log(result.coords)
        that.setState({
            actualLat:result.coords.latitude,
            actualLon:result.coords.longitude
        })
    })
}
  confirmPolyline = () => {

      var markers = []
    _.each(drawPolyline, function(value, key){ 
      console.log('inside the map')

      var value= value.toString().replace(/[()]/g, '').split(',')
      console.log('value=>', value)
      var obj = {lat: parseFloat(value[0]), lng:  parseFloat(value[1])}
       markers.push(obj)
       console.log('markers: ', markers)
    })


    this.setState({
      polyline: markers
    })
    console.log('state after confirm polyline: ', drawPolyline.toString(), ' item 0: ', drawPolyline[0], ' item 0 to string  ', drawPolyline[0].toString(), ' markers: ', markers)
  }

  addItem =()=>{
    var routes = firebaseDb.ref('routes')
   
    console.log("polyline: ", drawPolyline)
  	routes.push({
      title:this.state.title,
      distance:this.state.distance,
      description:this.state.description,
      level:this.state.level,
      files:this.state.files,
      city:this.state.city,
      country:this.state.country,
      state:this.state.state,
      polyline:this.state.polyline,
      actualLat:this.state.actualLat,
      actualLon:this.state.actualLon
    })
  }

   onMarkerClick = (props, marker, e) => {
  }

  selectCountry = (val) => {
    console.log('val country:', val)
    this.setState({country: val});
  }

  selectRegion = (val)=> {
    this.setState({state: val});
  }


   onDrop=(acceptedFiles, rejectedFiles)=> {
       console.log('Accepted files: ', acceptedFiles);
       console.log('Rejected files: ', rejectedFiles);
       this.setState({
          files: acceptedFiles
        })
     }  

 
  


	render() {



		return (
			<div>
			<Row>
    <h1>Creador de Rutas</h1>
      {(this.state.actualLat && this.state.actualLat)? 
        <MapWithADrawingManager lat={this.state.actualLat} lon={this.state.actualLon}/>:null }
        <br/>
        <Row>
        <Col md={6}>
    <Button onClick={this.confirmPolyline} block bsStyle="warning">Limpiar Mapa</Button>
    </Col>
    <Col md={6}>
    <Button onClick={this.confirmPolyline} block bsStyle="success">Confirmar</Button>
    </Col>
    </Row>
    <br/>
    <Row>
		  <h1>Detalles de la ruta</h1>
      <Col md={10}>
           <Col md={4}>
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
            <Col md={4}>
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
             <Col md={4}>
                  <FormGroup>
                     <ControlLabel>Ciudad </ControlLabel> <FormControl
                  type='text'
                  value={this.state.shippingCity}
                  placeholder='Ciudad'
                  maxLength="50"
                  ref='shippingCity'
                  name='shippingCity'
                  onChange={this.handleChange}/> 
                  </FormGroup>
                 
                  </Col>

    			<Col md={4}>
        			<ControlLabel>Nombre de la ruta</ControlLabel>
        				<input name="title" value={this.state.title} onChange={this.handleInputChange}  className="form-control" type="text" />
        		</Col>
        		<Col md={4}>
        				<ControlLabel>Distancia (KM)</ControlLabel>
        				<input name="distance" value={this.state.distance} onChange={this.handleInputChange}  className="form-control" type="text" />
        		</Col>
        		<Col md={4}>
        				<ControlLabel>Nivel</ControlLabel>
        				<input name="level" value={this.state.level} onChange={this.handleInputChange}  className="form-control" type="text" />
        				</Col>
      			<Col md={12}>
        				<ControlLabel>Descripción de la ruta</ControlLabel>
        				<input name="description" value={this.state.description} onChange={this.handleInputChange}  className="form-control" type="text" />
    				</Col>
        </Col>
        <Col md={2}>
        <ControlLabel>Imagen promocional</ControlLabel>
                <Dropzone onDrop={this.onDrop}  style={{height:'90px', border:'1px dashed #ccc', padding:'20px'}}>
                      Suelta la imagen aquí.
                    </Dropzone>
                        {this.state.files.length > 0 ? <div>
                         <h2>Uploading {this.state.files.length} files...</h2>
                         <div>{this.state.files.map((file) => <Image src={file.preview} responsive/> )}</div>

                         {this.state.files.map((file) => <div>{file.preview} </div> )}
                         </div> : null}

                           <br/>
       <Button bsStyle="primary" block onClick={this.addItem}>Añadir</Button>

      </Col>
      </Row>
			</Row>
			</div>
		);
	}
}


export class RoutesList extends Component {
	constructor(props){
		super(props)
		this.state = {
			routes:{}
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
	render() {
		return (
			<div>
				<Table responsive striped>
					<thead>
					<th>Imagen promocional de ruta</th>
					<th>Nombre de ruta</th>
					<th>Distancia (KM)</th>
					<th>Descripción de la ruta</th>
					<th>Nivel</th>
					<th>Acciones</th>
					</thead>
					<tbody>
						{_.map(this.state.routes, function(value, key){
							return <tr key={key}>
						<td></td>
						<td>{value.title}</td>
						<td>{value.distance}</td>
						<td>{value.description}</td>
						<td>{value.level}</td>
						<td>
						<Link to={'/route/'+key}><Button block bsSize="xsmall" bsStyle="info">Ver</Button></Link>
						<Button block  bsSize="xsmall" bsStyle="warning">editar</Button>
						<Button block bsSize="xsmall" bsStyle="danger">deshabilitar</Button>
						</td>
						</tr>
						})}
						
					</tbody>

				</Table>
			</div>
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