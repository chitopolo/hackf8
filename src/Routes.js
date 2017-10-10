
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
						{_.map(this.state.routes, function(value, key){
							return <div key={key}>
							<Row>
						<Col md={3}>
						<Image src={value.image} responsive/>
						</Col>
						<Col md={9}>
						<Row>
						<Col md={12}>
							<h2>{value.title}</h2>
						</Col>
						<Col md={9}>
						 <Button bsSize="small"><Glyphicon glyph="tree-conifer" /> {value.distance}</Button>
						 <Button bsSize="small"><Glyphicon glyph="sunglasses" /> {value.difficulty}</Button>
						<p>{value.description}</p>
						</Col>
						<Col md={3}>
							<Link to={'/route/'+key}><Button block bsSize="xsmall" bsStyle="info">Ver</Button></Link>
							<Button block  bsSize="xsmall" bsStyle="warning">editar</Button>
							<Button block bsSize="xsmall" bsStyle="danger">deshabilitar</Button>
						</Col>
						</Row>
						</Col>
						
						</Row>
						</div>
						})}
						
				
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