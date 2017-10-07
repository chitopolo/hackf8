import React, { Component} from 'react'
import Slider from 'react-slick'
import {Image, Grid, Col, Row} from 'react-bootstrap'


class Home extends Component {
    render () {
    	 var settings = {
      dots: true,
      infinite: true,
      speed: 500,	
      slidesToShow: 1,
      slidesToScroll: 1
    };
        return (
            <div>
                
                 <Slider {...settings}>
			        <div><Image src="/static/bicirutabanner1920.jpg" /></div>
			      </Slider>
			      <Grid>
                <h2>Biciruta es un app que te permite conocer las rutas de bici creadas por personas como tú, todo lo que tienes que hacer es unirte a una salida ya planificada o planificarla para que otras personas se unan!</h2> 
                </Grid>

                <Grid>
                <Row>
                	<Col md={4}><Image responsive src="/static/bicirutabanner1920.jpg" /></Col>
                	<Col md={4}><Image responsive src="/static/bicirutabanner1920.jpg" /></Col>
                	<Col md={4}><Image responsive src="/static/bicirutabanner1920.jpg" /></Col>
                </Row>
                </Grid>
            </div>
        )
    }
}

export default Home