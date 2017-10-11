import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Table, Button, Row, Col, Grid, ControlLabel, Image} from  'react-bootstrap'
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
import FacebookProvider, { Comments } from 'react-facebook';
import Slider from 'react-slick'



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
      difficulty:'',
      Route:{},
      files:[],
      polyline:[],
      actualLat:0,
      actualLon:0,
      userSavedData:{},
      editMode:true
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


        var RouteId = this.props.match.params.key
        var RouteData = firebaseDb.ref('routes').child(RouteId)
        RouteData.on('value', function(snapshot){
            console.log('Route ID: ', RouteId, ' value: ', snapshot.val())
            this.setState({
                title:snapshot.val().title,
                description:snapshot.val().description,
                distance:snapshot.val().distance,
                difficulty:snapshot.val().difficulty ||'',
                image:snapshot.val().image|| '',
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

     editData = () =>{  
      this.setState({
        editMode:!this.state.editMode
      })

     }

     saveData = () =>{  
        var RouteId = this.props.match.params.key
        var RouteData = firebaseDb.ref('routes').child(RouteId)
        console.log('to update:', {
          title:this.state.title,
          description:this.state.description,
          distance:this.state.distance,
          difficulty:this.state.difficulty,
          image:this.state.image,

        })



        RouteData.update({
          title:this.state.title,
          description:this.state.description,
          distance:this.state.distance,
          difficulty:this.state.difficulty,
          image:this.state.image,

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
 
  


	render() {

    var titleStyle= {
      height: '300px',
      width: '400px',
      fontSize: '30px',
      textAlign: 'center',
      padding: '0 20px',
      margin: '20px',
      display: 'flex',
      justifyContent: 'center', 
      alignItems: 'center', 
    }

    var descriptionStyle = {
      textAlign: 'justify',
      textJustify: 'inter-word'
    }
   var settings = {
      dots: true,
      infinite: true,
      speed: 500, 
      slidesToShow: 4,
      slidesToScroll: 1,
    };       
		return (
			<div>
      {this.state && 
			<Row>

      {(this.state.userSavedData.permissions <= 10) ? 
        <Row>
        <h3>Admin menu</h3>
        <Col md={4}><Button bsStyle="warning" block onClick={this.editData}>Editar</Button></Col>
        <Col md={4}><Button bsStyle="danger" block>Desactivar</Button></Col>
        <Col md={4}>{(this.state.editMode)? <Button bsStyle="info" block onClick={this.saveData}>Guardar Cambios</Button>: null }</Col>
        </Row>
        :null}
        <br/>

            <Row>
            <Col md={6}>

            


            <div style={titleStyle}>  {(this.state.editMode) ? <div> <ControlLabel>Titulo</ControlLabel> <input name="title" value={this.state.title} onChange={this.handleInputChange}  className="form-control" type="text" /> </div>: <div>{this.state.title}</div>}  </div>
            </Col>
            <Col md={6}>
            { this.state.image ? <Image src={this.state.image} responsive thumbnail/> :  <Image src="./../static/img/bicirutabw.png" responsive />}
              
            </Col>
            </Row>
            <br/>
            {(this.state.actualLat && this.state.actualLat)? 
            	<MapWithADrawingManager RoutePolyline={this.state.polyline} lat={this.state.actualLat} lon={this.state.actualLon}/>:null }
	           
        <Row>
      <br/>

        
        <Col md={9}>

        <h3>Descripción  </h3>

           

            <p style={descriptionStyle}>{(this.state.editMode) ? <textarea name="title" value={this.state.description} onChange={this.handleInputChange}  className="form-control" type="text" /> : <div>{this.state.description}</div>} </p>
            </Col>
            <Col md={3}>
            <Row>
            <h3>Nivel:</h3> {(this.state.editMode) ? <input name="difficulty" value={this.state.difficulty} onChange={this.handleInputChange}  className="form-control" type="text" /> : <div>{this.state.difficulty}</div>} 
            <h3>Distancia (Km):</h3> {(this.state.editMode) ? <input name="distance" value={this.state.distance} onChange={this.handleInputChange}  className="form-control" type="text" /> : <div>{this.state.distance}</div>}  
            </Row>
            </Col>
		</Row>
    <br/>

    <h2>Fotografías de la ruta   {(this.state.editMode) ? <Button >Editar Imagenes</Button>:null}</h2>

             <div style={{maxHeight:'200px'}}>
              <Slider {...settings}>
              <div><Image src="/static/bicirutabanner1920.jpg" style={{maxHeight:'200px'}}/></div>
              <div><Image src="/static/bicirutabanner1920.jpg" style={{maxHeight:'200px'}}/></div>
              <div><Image src="/static/bicirutabanner1920.jpg" style={{maxHeight:'200px'}}/></div>
              <div><Image src="/static/bicirutabanner1920.jpg" style={{maxHeight:'200px'}}/></div>
              <div><Image src="/static/bicirutabanner1920.jpg" style={{maxHeight:'200px'}}/></div>
            </Slider>
            </div>



<br/>
    <Row>
    <Col md={6}>
    </Col>
    <Col md={6}>
       <FacebookProvider appId="1621089814578682">
        <Comments  href={"http://www.biciruta.com/"+this.props.match.url}/>
      </FacebookProvider>
      </Col>
    </Row>

			</Row>}

			</div>
		);
	}
}

export default withRouter(RouteCreator)