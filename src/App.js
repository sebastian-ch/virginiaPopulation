import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

import {mask} from '@turf/turf'
import data from './vaNum.geojson'
import dissolved from './dissolve.geojson'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2ViYXN0aWFuLWNoIiwiYSI6ImNpejkxdzZ5YzAxa2gyd21udGpmaGU0dTgifQ.IrEd_tvrl6MuypVNUGU5SQ';


function App() {

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-79.1);
  const [lat, setLat] = useState(37.7);
  const [zoom, setZoom] = useState(6.5);
  const [countyName, setCountyName] = useState('Hover on a County to get data');
  const [title, setTitle] = useState('Population in 2020');
  const [vpop2020, setPop2020] = useState()
  const [vpop2010, setPop2010] = useState()
  const [vpopChange, setPopChange] = useState()

  var id;
  

  useEffect(() => {

    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [lng, lat],
      zoom: zoom,
      dragPan: false
    });



    map.current.on('load', () => {




      //find the first symbol layer so I can put the geojson's under its
      const layers = map.current.getStyle().layers;
      var firstSymbolId;
        for (var i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
          }
      }


      //add the mask layer
      //slightly unnecessary, but I wanted to play with turf mask and it's really cool!
      fetch(dissolved)
        .then(resp => resp.json())
        .then(data => {
      
          const bbox1 = mask(data);

            map.current.addLayer({
              'id': 'mask',
              'type': 'fill',
              'source': {
                  'type': 'geojson',
                  'data': bbox1
              },
              'layout': {},
              'paint': {
                  'fill-color': 'gray',
                  'fill-opacity': 0.8
              }
          }, firstSymbolId
          );
        })



       
      map.current.addSource('countries', {
        type: 'geojson',
        data
      })


      //add fill layer
      map.current.addLayer(
        {
          id: 'va',
          type: 'fill',
          source: 'countries',
          'paint': {
            
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', '2020pop'],
              0, "#d7d7d7",
              49448, '#A1ABC0',
              137739, '#6B80A9',
              247564, '#355492',
              1146200, '#00297b'
        
            ],
            'fill-opacity': 0.75
            }
        }, firstSymbolId
      );


      //add outlines of counties
      map.current.addLayer(
        {
          'id': 'outline',
          'type': 'line',
          'source': 'countries',
          'paint': {
            'line-color': [
              'interpolate',
              ['linear'],
              ['get', '2020pop'],
              0, "#d7d7d7",
              49448, '#A1ABC0',
              137739, '#6B80A9',
              247564, '#355492',
              1146200, '#00297b'
        
            ]
          }
        }, firstSymbolId
      );

    });

    map.current.on('mousemove', 'va', (e) => {

      console.log(id)
     
      setCountyName(e.features[0].properties.Locality)
      setPop2020(e.features[0].properties['2020pop'].toLocaleString())
      setPop2010(e.features[0].properties['2010pop'].toLocaleString())
      setPopChange(e.features[0].properties['NumCh2010'].toLocaleString())

    /*  new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(e.features[0].properties.Locality)
        .addTo(map.current) */

    })

    map.current.on('mouseout', 'va', (e) => {

      setCountyName('Hover on a County to get data')
      setPop2020()
      setPop2010()
      setPopChange()
    
      
    }) 


  });


  function pop2020() {

    var id = '2020pop';
    console.log(id)

    map.current.setPaintProperty('va', 'fill-color',
    [
      'interpolate',
      ['linear'],
      ['get', id],
      0, "#d7d7d7",
      49448, '#A1ABC0',
      137739, '#6B80A9',
      247564, '#355492',
      1146200, '#00297b'

    ]);

    map.current.setPaintProperty('outline', 'line-color',
    [
      'interpolate',
      ['linear'],
      ['get', id],
      0, "#d7d7d7",
      49448, '#A1ABC0',
      137739, '#6B80A9',
      247564, '#355492',
      1146200, '#00297b'

    ]);


    setTitle('Population in 2020')
  

  }


  function pop2010(){


    id = '2010pop'
    console.log(id)


    map.current.setPaintProperty('va', 'fill-color',
    [
      'interpolate',
      ['linear'],
      ['get', id],
      0, "#d7d7d7",
      46689, '#A1ABC0',
      122397, '#6B80A9',
      242803, '#355492',
      437994, '#00297b'

    ]);

    map.current.setPaintProperty('outline', 'line-color',
    [
      'interpolate',
      ['linear'],
      ['get', id],
      0, "#d7d7d7",
      46689, '#A1ABC0',
      122397, '#6B80A9',
      242803, '#355492',
      437994, '#00297b'

    ]);


    setTitle('Population in 2010')
  
  }

  function popChangeSince2010() {


    id = 'NumCh2010'

    map.current.setPaintProperty('va', 'fill-color',
    [
      'interpolate',
      ['linear'],
      ['get', id],
      -3647, "#ff350f",
      0, "#ccc",
      106379, '#00297b'

    ]);


    map.current.setFilter('outline', ['==', 'Locality', 'Loudon County'])
    map.current.setPaintProperty('outline', 'line-color', 'orange'
    /*[
      'interpolate',
      ['linear'],
      ['get', id],
      -3647, "#ff350f",
      0, "#ccc",
      106379, '#00297b'

    ] */
    
    
    
    );



    setTitle('Population Change Since 2010')


  }


  
  return (
    <div className="App">
      <div className="sidebar">
        <div className='words'>
          <b><h3>Map Currently Showing {title} </h3></b><br></br>
          County Name: {countyName} <br></br>
          Population 2020: {vpop2020} <br></br>
          Population 2010: {vpop2010} <br></br>
          Population Change: {vpopChange} <br></br>
          <div className='allButtons'>
            <button onClick={pop2020} className='button'>Population in 2020</button> <br></br>
            <button onClick={pop2010} className='button'>Population in 2010</button> <br></br>
            <button onClick={popChangeSince2010} className='button'>Pop change since 2010</button><br></br>
          </div> 

       </div>
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;
