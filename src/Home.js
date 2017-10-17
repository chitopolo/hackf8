import React, { Component} from 'react'
import Slider from 'react-slick'
import {Image, Grid, Col, Row} from 'react-bootstrap'
import {Link} from 'react-router-dom'

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
                <header className="masthead">
      <div className="header-content">
        <div className="header-content-inner">
          <h1 id="homeHeading">Crea o únete a rutas de bici en tu ciudad</h1>
          <hr/>
          <p>Biciruta es una herramienta para crear y organizar salidas de tu club o de forma independiente</p>
          <Link to="/routes"> <a className="btn btn-primary btn-xl js-scroll-trigger">Ver las rutas</a></Link>
        </div>
      </div>
    </header>

                 <section className="bg-primary" id="about">
      <Grid>
        <div className="row">
          <Col md={12} lg={12} className="mx-auto text-center">
            <h2 className="section-heading text-white">¡Sigamos pedaleando juntos!</h2>
            <hr className="light"/>
            <p className="text-faded">¡Biciruta es muy sencillo de utilizar, simplemente busca las rutas de tu ciudad, únete u organiza una!</p>
           <Link to="/signup">  <a className="btn btn-default btn-xl js-scroll-trigger">¡Crea tu cuenta ahora!</a></Link>
          </Col>
        </div>
      </Grid>
    </section>

    <section id="services">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 text-center">
            <h2 className="section-heading">La herramienta completa</h2>
            <hr className="primary"/>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6 text-center">
            <div className="service-box">
              <i className="fa fa-4x fa-diamond text-primary sr-icons"></i>
              <h3>Clubs</h3>
              <p className="text-muted">Crea u organiza a tu club, administra las reglas, escribe la historia y mucho mas.</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 text-center">
            <div className="service-box">
              <i className="fa fa-4x fa-paper-plane text-primary sr-icons"></i>
              <h3>Rutas</h3>
              <p className="text-muted">Crea u organiza las rutas que conozcas o descubras</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 text-center">
            <div className="service-box">
              <i className="fa fa-4x fa-newspaper-o text-primary sr-icons"></i>
              <h3>Calendario</h3>
              <p className="text-muted">¡Revisa un calendario de actividades de todas las salidas de la semana!</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 text-center">
            <div className="service-box">
              <i className="fa fa-4x fa-heart text-primary sr-icons"></i>
              <h3>Descubre</h3>
              <p className="text-muted">Descubre rutas que esten dentro o fuera de tu ciudad</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div className="call-to-action bg-dark">
      <div className="container text-center">
        <h2>¿Apoyas esta iniciativa? ¿Quieres decirnos algo?</h2>
        <a className="btn btn-default btn-xl sr-button" href="http://startbootstrap.com/template-overviews/creative/">Contáctanos</a>
      </div>
    </div>

    <section id="contact">
      <div className="container">
        <div className="row">
          <Col lg={12} className="mx-auto text-center">
            <h2 className="section-heading">Let's Get In Touch!</h2>
            <hr className="primary"/>
            <p>Ready to start your next project with us? That's great! Give us a call or send us an email and we will get back to you as soon as possible!</p>
          </Col>
        </div>
        <div className="row">
          <Col lg={6} className="ml-auto text-center">
            <i className="fa fa-phone fa-3x sr-contact"></i>
            <p>123-456-6789</p>
          </Col>
          <Col lg={6} className="mr-auto text-center">
            <i className="fa fa-envelope-o fa-3x sr-contact"></i>
            <p>
              <a href="mailto:your-email@your-domain.com">feedback@startbootstrap.com</a>
            </p>
          </Col>
        </div>
      </div>
    </section>


    
               
            </div>
        )
    }
}

export default Home