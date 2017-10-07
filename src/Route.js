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
  Polyline
} from "react-google-maps";
import { Link, withRouter } from 'react-router-dom'
import DrawingManager from "react-google-maps/lib/components/drawing/DrawingManager";

var drawPolyline = []

var flightPlanCoordinates = [
    {lat: 37.772, lng: -122.214},
    {lat: 21.291, lng: -157.821},
    {lat: -18.142, lng: 178.431},
    {lat: -27.467, lng: 153.027}
  ];


const MapWithADrawingManager = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBdaG4W9-9ETMwF1WZcZxBnkvj6G2PKiL0&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `600px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)(props =>
  <GoogleMap
    defaultZoom={15}
    defaultCenter={new google.maps.LatLng(parseFloat(props.lat), parseFloat(props.lon))}
  >
  {console.log(props)}
  
    <Polyline 
    path= {props.RoutePolyline}
    geodesic= {true}
          strokeColor= '#FF0000'
          strokeOpacity= "1.0"
          strokeWeight= "2"
          />
  </GoogleMap>
);






class RouteCreator extends Component {
	constructor(props, context){
		super(props, context)
		this.state={
			title:'',
			distance:'',
			description:'',
            level:'',
            Route:{},
      files:[],
      polyline:[],
      actualLat:0,
      actualLon:0
		}
    }
    componentWillMount(){
        var RouteId = this.props.match.params.key
        var RouteData = firebaseDb.ref('routes').child(RouteId)
        RouteData.on('value', function(snapshot){
            console.log('Route ID: ', RouteId, ' value: ', snapshot.val())
            this.setState({
                Route:snapshot.val()
            })
        }, this)
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

  handleInputChange=(event)=>{
    const target = event.target;
    const value =  target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }
  confirmPolyline = () => {

      var markers = []
    _.each(drawPolyline, function(value, key){ 
      console.log('inside the map')

      
       markers.push(value.toString())
    })


    this.setState({
      polyline: markers
    })
    console.log('state after confirm polyline: ', drawPolyline.toString(), ' item 0: ', drawPolyline[0], ' item 0 to string  ', drawPolyline[0].toString(), ' markers: ', markers)
  }

  addItem =()=>{
    var routes = firebaseDb.ref('routes')
   
    console.log("polyline: ", drawPolyline)
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
            <h1>{this.state.Route.title}</h1>

            {(this.state.actualLat && this.state.actualLat)? 
            	<MapWithADrawingManager RoutePolyline={this.state.Route.polyline} lat={this.state.actualLat} lon={this.state.actualLon}/>:null }
	
        <Row>
        <Col md={9}>
        <h3>Descripción</h3>
            <p>{this.state.Route.description}</p>
            </Col>
            <Col md={3}>
            <Row>
            <h3>Nivel:</h3> {this.state.Route.level}
            <h3>Distancia (Km):</h3> {this.state.Route.distance}
            </Row>
            </Col>
		</Row>

			</Row>
			</div>
		);
	}
}

export default withRouter(RouteCreator)