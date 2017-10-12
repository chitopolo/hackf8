import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Table, Button, Row, Col, Grid, ControlLabel, Image, ProgressBar, Thumbnail} from  'react-bootstrap'
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
      images:'',
      userSavedData:{},
      editMode:false,
      aditionalImages:''
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
                images:snapshot.val().images|| '',
                caution:snapshot.val().caution|| '',
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

  handleInputChange = (event)=>{
    const target = event.target;
    const value =  target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

    onDrop2 = (acceptedFiles, rejectedFiles) =>{
        console.log('Accepted files: ', acceptedFiles);
        console.log('Rejected files: ', rejectedFiles);
        this.setState({
           aditionalImages: acceptedFiles
         })
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
          caution:this.state.caution,

        })



        RouteData.update({
          title:this.state.title,
          description:this.state.description,
          distance:this.state.distance,
          difficulty:this.state.difficulty,
          image:this.state.image,
          caution:this.state.caution,

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


   addImage = ()=> {
var that = this

 

    if(this.state.aditionalImages.length>0){

    var routes = firebaseDb.ref('routes/'+this.props.match.params.key+'/images')
    firebaseStorage.ref('routes/'+this.props.match.params.key+'/images/'+ this.state.aditionalImages[0].name).getDownloadURL().then(onResolve, onReject);

     function onResolve(foundURL) {
       routes.push(foundURL)
    }

     function onReject(error) {
    var uploadTask = firebaseStorage.ref('routes/'+that.props.match.params.key+'/images/'+ that.state.aditionalImages[0].name).put(that.state.aditionalImages[0])

    uploadTask.on('state_changed', function(snapshot){
      // Observe state change events such as progress, pause, and resume
      console.log("snapshot: ", snapshot)

      var progress2 = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

      that.setState({
        progress2: progress2
      })
      console.log('Upload is ' + progress2 + '% done');
      switch (snapshot.state) {
        case 'paused': // or 'paused'
          console.log('Upload is paused');
          break;
        case 'running': // or 'running'
          console.log('Upload is running');
          break;
      }
      // See below for more detail
    }, function(error) {
      // Handle unsuccessful uploads
      console.log("error: ", error)

    }, function() {
      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      var downloadURL = uploadTask.snapshot.downloadURL;
      console.log("download URL", downloadURL)

     routes.push(downloadURL)

    });
    }
    }
  }
	render() {
    var imageBackgroundToShow = this.state.image || './../static/img/bicirutabw.png'
    var titleStyle= {
      height: '100px',
      fontSize: '30px',
      textAlign: 'center',
      padding: '10px',
      marginTop: '150px',
      display: 'flex',
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor:'white',
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
      textAlign: 'center',
       opacity: 0.9
    }
    var backgroundStyle = {

      position: 'fixed',
      left: 0,
      right: 0,
      zIndex: 1,  
      backgroundImage: 'url('+imageBackgroundToShow+')',
      position:'relative',
      minHeight:'500px',
      display: 'block'
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
    var contentStyle = {
      position: 'relative',
      left: 0,
      right: 0,
      zIndex: 9999,
      marginLeft: '20px',
      marginRight: '20px',

    }
    var primaryImage = {
      marginTop:'60px',

    }
		return (
			<div>
      {this.state && 
			<Row>

      <Grid>{(this.state.userSavedData.permissions <= 10) ? 
        <Row>
        <Col md={4}><Button bsStyle="warning" block onClick={this.editData}>Editar</Button></Col>
        <Col md={4}><Button bsStyle="danger" block>Desactivar</Button></Col>
        <Col md={4}>{(this.state.editMode)? <Button bsStyle="info" block onClick={this.saveData}>Guardar Cambios</Button>: null }</Col>
        </Row>
        :null} </Grid>

            <div style={backgroundStyle}>
              <Grid>
                <div style={contentStyle}>
              <Col md={6} >


            <div style={titleStyle}>  {(this.state.editMode) ? 
              <div> <ControlLabel>Titulo</ControlLabel> 
              <input name="title" value={this.state.title} onChange={this.handleInputChange}  className="form-control" type="text" /> </div>: <div>{this.state.title}</div>} 
               </div>
            </Col>
            <Col md={6}>
            { this.state.image ? <Image src={this.state.image} style={primaryImage} responsive thumbnail/> :  <Image src="./../static/img/bicirutabw.png" responsive />}
              
            </Col>

            </div>
              </Grid>
            </div>

<Grid>          
<Row style={{paddingTop:'100px', paddingBottom:'100px'}}>
      <br/>
        <Col md={9}>
        <h3>Descripción  </h3>
            <p style={descriptionStyle}>{(this.state.editMode) ? <textarea name="title" value={this.state.description} onChange={this.handleInputChange}  className="form-control" type="text" /> : <div>{this.state.description}</div>} </p>
            </Col>
            <Col md={3}>
            <Row>
            <h3>Nivel:</h3> {(this.state.editMode) ? <input name="difficulty" value={this.state.difficulty} onChange={this.handleInputChange}  className="form-control" type="text" /> : <div>{this.state.difficulty}</div>} 
            <h3>Distancia (Km):</h3> {(this.state.editMode) ? <input name="distance" value={this.state.distance} onChange={this.handleInputChange}  className="form-control" type="text" /> : <div>{this.state.distance}</div>}  
            <br/>
            </Row>
            </Col>
    </Row>  
            </Grid>
            
            <h1 style={{textAlign:'center'}}>Detalle de la ruta</h1>


            {(this.state.actualLat && this.state.actualLat)? 
            	<MapWithADrawingManager RoutePolyline={this.state.polyline} lat={this.state.actualLat} lon={this.state.actualLon}/>:null }
	           
        <Grid style={{marginTop:'100px', marginBottom:'100px'}}> 

    <Row style={{paddingTop:'100px', paddingBottom:'100px'}}>
      <br/>
        <Col md={12}>
        <h3>Precauciones de la Ruta  </h3>
            <p style={descriptionStyle}>{(this.state.editMode) ? <textarea name="caution" value={this.state.caution} onChange={this.handleInputChange}  className="form-control" type="text" /> : <div>{this.state.caution}</div>} </p>
            </Col>
    </Row> 

    <h2>Fotografías de la ruta</h2>   {(this.state.editMode) ? <Row>
      <Col md={4}>
          
          <Row>
                {(Object.keys(this.state.aditionalImages).length) ? _.map(this.state.aditionalImages, function(value){
                  console.log('value: ', value)
                  return <Col md={2}><Thumbnail><Image src={value} responsive /></Thumbnail></Col> 

                  }):null}
                  </Row>  
           <Dropzone onDrop={this.onDrop2}>
              Suelta la imagen aquí.
            </Dropzone>

            {this.state.aditionalImages.length > 0 ? <div>
                         <h2>Uploading {this.state.aditionalImages.length} images...</h2>
                         <div>{this.state.aditionalImages.map((file) => <Image src={file.preview} responsive/> )}</div>

                         {this.state.aditionalImages.map((file, key) => <div key={key}>{file.preview} </div> )}
                         </div> : null}
                   

                          <ProgressBar  striped bsStyle="success" now={this.state.progress2} label={`${this.state.progress2}%`} />
                          <Button onClick={this.addImage}>Añadir Foto</Button>
                          </Col>
                          </Row>:null}


             
            {(Object.keys(this.state.images).length >= 0)?  <div style={{height:'300px'}}>
              <Slider {...settings}>
              {_.map(this.state.images, function(value, key){
              return <div key={key}><Image src={value} responsive/></div>

              })}
            </Slider>
            </div>: null}



            


</Grid>
<Grid>
  
    <Row>
    <Col md={6}>
    </Col>
    <Col md={6}>
       <FacebookProvider appId="1621089814578682">
        <Comments  href={"http://www.biciruta.com/"+this.props.match.url}/>
      </FacebookProvider>
      </Col>
    </Row>
</Grid>

			</Row>}



			</div>
		);
	}
}

export default withRouter(RouteCreator)