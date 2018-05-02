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
            </div>
        )
    }
}

export default Home