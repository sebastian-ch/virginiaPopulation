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
  const [countyName, setCountyName] = useState();
  const [title, setTitle] = useState('Population in 2020');
  

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

      const layers = map.current.getStyle().layers;
      // Find the index of the first symbol layer in the map style
      var firstSymbolId;
        for (var i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
          }
      }

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

     
      setCountyName(e.features[0].properties.Locality)

    /*  new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(e.features[0].properties.Locality)
        .addTo(map.current) */

    })

    map.current.on('mouseout', 'va', (e) => {

      setCountyName()
    
      
    }) 


  });


  function pop2020() {

    var id = '2020pop';

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
      ['get', '2020pop'],
      0, "#d7d7d7",
      49448, '#A1ABC0',
      137739, '#6B80A9',
      247564, '#355492',
      1146200, '#00297b'

    ]);


    setTitle('Population in 2020')
  

  }


  function pop2010(){

    map.current.setPaintProperty('va', 'fill-color',
    [
      'interpolate',
      ['linear'],
      ['get', '2010pop'],
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
      ['get', '2010pop'],
      0, "#d7d7d7",
      46689, '#A1ABC0',
      122397, '#6B80A9',
      242803, '#355492',
      437994, '#00297b'

    ]);


    setTitle('Population in 2010')
  
  }

  function popChangeSince2010() {



    map.current.setPaintProperty('va', 'fill-color',
    [
      'interpolate',
      ['linear'],
      ['get', 'NumCh2010'],
      -3647, "#ff350f",
      0, "#ccc",
      106379, '#00297b'

    ]);


    map.current.setPaintProperty('outline', 'line-color',
    [
      'interpolate',
      ['linear'],
      ['get', 'NumCh2010'],
      -3647, "#ff350f",
      0, "#ccc",
      106379, '#00297b'

    ]);



    setTitle('Population Change Since 2010')


  }


  
  return (
    <div className="App">
      <div className="sidebar">
        <div className='words'>
          {title} <br></br>
          County Name: {countyName} <br></br>
          Population: <br></br>
          <div className='allButtons'>
            <button onClick={pop2020} className='button'>Population in 2020</button> <br></br>
            <button onClick={pop2010} className='button'>Population in 2010</button> <br></br>
            <button onClick={popChangeSince2010} className='button'>Pop change since 2010</button><br></br>
          </div> 
       </div>
      </div>
      <div ref={mapContainer} className="map-container" />
      <footer>Made with React, Mapbox, and Turf.js</footer>
    </div>
  );
}

export default App;
