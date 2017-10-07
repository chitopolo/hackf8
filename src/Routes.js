import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Table, Button, Row, Col, Grid, ControlLabel} from  'react-bootstrap'
import {firebaseDb, firebaseAuth, firebaseStorage} from './../dist/static/js/firebase';
import _ from 'underscore'
import Dropzone from 'react-dropzone'
import { compose, withProps } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
} from "react-google-maps";
import DrawingManager from "react-google-maps/lib/components/drawing/DrawingManager";

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
    defaultCenter={new google.maps.LatLng(-17.413977, -66.165322)}
  >
    <DrawingManager
      defaultDrawingMode={google.maps.drawing.OverlayType.POLYLINE}
      onPolylineComplete={(stuff)=>{console.log(stuff.getPath().getArray().toString())}}
      defaultOptions={{
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            google.maps.drawing.OverlayType.CIRCLE,
            google.maps.drawing.OverlayType.POLYGON,
            google.maps.drawing.OverlayType.POLYLINE,
            google.maps.drawing.OverlayType.RECTANGLE,
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
      	<h1>Rutas</h1>
      	<RouteCreator />
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
			files:[]
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
  addItem =()=>{
  	var routes = firebaseDb.ref('routes')
  	routes.push(this.state)
  }

   onMarkerClick = (props, marker, e) => {
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

		<MapWithADrawingManager />
			<Col md={3}>
			  <Dropzone onDrop={this.onDrop}  style={{height:'90px', border:'1px dashed #ccc', padding:'20px'}}>
				              Suelta la imagen aquí.
				            </Dropzone>
                        {this.state.files.length > 0 ? <div>
                         <h2>Uploading {this.state.files.length} files...</h2>
                         <div>{this.state.files.map((file) => <Image src={file.preview} responsive/> )}</div>

                         {this.state.files.map((file) => <div>{file.preview} </div> )}
                         </div> : null}

			</Col>
			<Col md={5}>
			<ControlLabel>Nombre de la ruta</ControlLabel>
				<input name="title" value={this.state.title} onChange={this.handleInputChange}  className="form-control" type="text" />
				</Col>
				<Col md={2}>
				<ControlLabel>Distancia (KM)</ControlLabel>
				<input name="distance" value={this.state.distance} onChange={this.handleInputChange}  className="form-control" type="text" />
				</Col>
				<Col md={2}>
				<ControlLabel>Nivel</ControlLabel>
				<input name="level" value={this.state.level} onChange={this.handleInputChange}  className="form-control" type="text" />
				</Col>
				<Col md={6}>
				<ControlLabel>Descripción de la ruta</ControlLabel>
				<input name="description" value={this.state.description} onChange={this.handleInputChange}  className="form-control" type="text" />
				</Col>
				<ControlLabel> _</ControlLabel>
				<Col md={3}> <Button bsStyle="primary" block onClick={this.addItem}>Añadir</Button></Col>

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
						<Button block bsSize="xsmall" bsStyle="info">Ver</Button>
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