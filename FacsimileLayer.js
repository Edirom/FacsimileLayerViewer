/**
 * Creates a new class FacsimileLayer that extend from L.TileLayer.
 * @class
 * @classdesc FacsimileLayer is for show not square tile layers.
 */
L.TileLayer.FacsimileLayer = L.TileLayer.extend({
	
	/**
    * Global variable to define bounds of the rectangle.
    * @type {LatLngBounds}
    */
	bounds: null,
	
	/**
    * Global variable to define a rectangle.
    * @type {Rectangle}
    */
	rectangle: null,
	
	/**
    * Global variable to define the rectangle center.
    * @type {Circle}
    */
	rectangleCenter: null,
	
	/** 
	 * Initialite a facsimile layer.
     * @overrides
     * @param {string} url - path.
     * @param {object} options - optionally options for layer.
     */
	initialize: function (url, options) {
	   L.TileLayer.prototype.initialize.call(this, url, options);
	},
	
    /**
    * Create and show a rectangle with given coordinates in pixel
    * @param {number} ulx - left x coordinate.
    * @param {number} uly - left y coordinte.
    * @param {number} lrx - right x coordinate.
    * @param {number} lry - right y coordinste.
    */
     enableRectangle: function(ulx, uly, lrx, lry){
       if(typeof rectangle === 'undefined' || rectangle === null){
            // define points in coordinates system
            var pointLeft = L.point(ulx, uly);
            var pointRight = L.point(lrx, lry);
       
            // convert coordinates in degrees
            var latLngLeft = this._map.unproject(pointLeft, this._map.getMinZoom());
            var latLngRight = this._map.unproject(pointRight, this._map.getMinZoom());
         
	       // create bounds for a rectangle
	       bounds = L.latLngBounds(latLngLeft, latLngRight);
     
            // create rectangle
	       rectangle = L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);
	    }
       },     
       
     /**
      * Remove rectanle and center from map.
     */
       disableRectangle: function(){
          if(typeof rectangle !== 'undefined' && this._map.hasLayer(rectangle)){
            this._map.removeLayer(rectangle);
            rectangle = null;
          }
          if(typeof rectangleCenter !== 'undefined' && this._map.hasLayer(rectangleCenter)){
            this._map.removeLayer(rectangleCenter);
            rectangleCenter = null;
          }   
       },
       
     /**
      * Show and zoom rectangle in windows center.
     */
       zoomRectangle: function(){
           if(typeof bounds !== 'undefined' && bounds !== null){
            this._map.fitBounds(bounds);
           }         
       },
          
   /**
    * Compute and show center for given bounds.
    * @param {number} ulx - left x coordinate.
    * @param {number} uly - left y coordinte.
    * @param {number} lrx - right x coordinate.
    * @param {number} lry - right y coordinste.
    */
     showRectangleCenter: function(ulx, uly, lrx, lry){  
       if(typeof rectangleCenter === 'undefined' || rectangleCenter === null){
           var centerPoint = L.point((lrx-ulx)/2+ulx, (lry-uly)/2+uly);
           // convert coordinates in degrees
		   var latLngCenterPoint = this._map.unproject(centerPoint, this._map.getMinZoom());
		   // create circle in center          
           rectangleCenter = L.circle([latLngCenterPoint.lat, latLngCenterPoint.lng], 100, {
               color: 'red',
               fillColor: '#f03',
               fillOpacity: 0.5
           }).addTo(this._map);
          }
        },	
      
	
    _addTile: function (coords, container) {
    
    var originalMaxWidth = 2304;   
    var originalMaxHeight = 3456;
	
	var maxZoom = this._map.getMaxZoom();    
    var currZoom = this._map.getZoom();
    
    var numberCol = originalMaxWidth/(256*(Math.pow(2,maxZoom-currZoom)));
    var numberRow = originalMaxHeight/(256*(Math.pow(2,maxZoom-currZoom)));
   
    if((currZoom === 0 && coords.x === 0 && coords.y === 0)){
        L.TileLayer.prototype._addTile.call(this, coords, container);
    }    
    else if(coords.y < numberRow && coords.x < numberCol
    && coords.x >= 0 && coords.y >=0 && currZoom > 0){
        L.TileLayer.prototype._addTile.call(this, coords, container);
    }  
  }, 	
	
    /**
    * Create a canvas element to override tileSize of Tilelayer.
    * @override
    */
	_tileOnLoad: function () {
		var canvasTiles = document.createElement("canvas");		
		canvasTiles.width = canvasTiles.height = this._layer.options.tileSize;
		this.canvasContext = canvasTiles.getContext("2d");		
		var ctx = this.canvasContext;
		if (ctx) {
			this.onload  = null; 
			ctx.drawImage(this, 0, 0);
			var imgData = ctx.getImageData(0, 0, this._layer.options.tileSize, this._layer.options.tileSize);
			ctx.putImageData(imgData, 0, 0);
			this.src = ctx.canvas.toDataURL();			
		}

		L.TileLayer.prototype._tileOnLoad.call(this);
	}
});

/**
    * create instance of FacsimileLayer, passing url and options to the constructor
    * @override
    * @param {string} url - path.
    * @param {object} options - optionally options for layer.
    */
L.tileLayer.facsimileLayer = function (url, options) {
	return new L.TileLayer.FacsimileLayer(url, options);
};