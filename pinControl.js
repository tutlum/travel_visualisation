/*
 * Author: Sascha Schleef
 * Project: Distance Visualisation of two People
 * Year: 06/2018
 */
      // This example requires the Geometry library. Include the libraries=geometry
      // parameter when you first load the API. For example:
      // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry">

      var marker1, marker2;
      var poly, geodesicPoly;
      var ticker=0;
      var route=[];
      var ortArrayM1=[];
      var ortArrayM2=[];
      var pathM1=[];
      var pathM2=[];
      //var j = 0;
      var autostop=false;
      var updatezoom=0;
      var locationsLatLng={};//{"Berlin":{lat:15,lng:12}};
      var dummyLatLng={lat:50,lng:8};
      var default_dayperstep=1;
      var ticksPerSecond=30;
      var icons={};
      var map=null;
      var totalDays=0;
      
      var fastDayRate=1; //ticks to complete a day
	  var slowDayRate=1/4;
	  var defStepsForFly=10;
      
      
    var start=[2018,1,1];
    var end=[2018,06,20];
      
      function reset(){
		  
		  ortArrayM1=[];
		  ortArrayM2=[];
		  pathM1=[];
		  pathM2=[];
		  document.getElementById('dataValM1').innerHTML=":-)";
		  document.getElementById('dataValM2').innerHTML=":-)";
		  document.getElementById('orteVal').innerHTML=":-)";
		  document.getElementById('genPaths').innerHTML=":-)";
		  document.getElementById('totaltogether').innerHTML=0;
		  document.getElementById('together').innerHTML=0;
		  document.getElementById('distance').innerHTML=0;
		  document.getElementById('date').innerHTML="";
		  document.getElementById('marker1').innerHTML="";
		  document.getElementById('marker2').innerHTML="";
		  var canvas = document.getElementById("canvas");
		  var context = canvas.getContext("2d");
		  context.clearRect(0,0,canvas.width,canvas.height);
		  document.getElementById('title_orig').style.fontsize="40px";
		  document.getElementById('title_trans').style.fontsize="30px";
	  }
      function playpause(){
		  if (document.getElementById('play').value=="Play"){
			  autostop=false;
			  tick();
			  document.getElementById('play').value="Pause";
		  }else{
			  autostop=true;
			  document.getElementById('play').value="Play";
		  }
	  }
		function newBounds(){
			var bounds =null;
			if (marker1.getPosition().lat()>marker2.getPosition().lat()){
				bounds= new google.maps.LatLngBounds(marker2.getPosition(), marker1.getPosition());
			}else{
				bounds= new google.maps.LatLngBounds(marker1.getPosition(), marker2.getPosition());
			}
        
			map.fitBounds(bounds,2);
			updatezoom=0;
		}
      function initMap() {
		  
		document.getElementById('filesOrte').addEventListener('change', generateLocationsFromFile, false);
		document.getElementById('filesM1').addEventListener('change', handleFileSelect_Marker1, false);
		document.getElementById('filesM2').addEventListener('change', handleFileSelect_Marker2, false);
		//document.getElementById('generate').addEventListener('onclick', generatePath, false);
        map = new google.maps.Map(document.getElementById('map'), {
          
          minZoom: 3,
          zoom: 5,
          center: {lat: 50, lng: 8},
          styles: styles['silver_style'],
          mapTypeControl:null
        });

        map.controls[google.maps.ControlPosition.TOP_CENTER].push(
            document.getElementById('info'));
            
        // Add a style-selector control to the map.
        //var styleControl = document.getElementById('style-selector-control');
        //map.controls[google.maps.ControlPosition.TOP_LEFT].push(styleControl);

        // Set the map's style to the initial value of the selector.
        var styleSelector = document.getElementById('style-selector');
        map.setOptions({styles: styles[styleSelector.value]});

        // Apply new JSON when the user selects a different style.
        styleSelector.addEventListener('change', function() {
          map.setOptions({styles: styles[styleSelector.value]});
        });

        marker1 = new google.maps.Marker({
          map: map,
          draggable: true,
          position: {lat: 40.714, lng: -74.006}
        });

        marker2 = new google.maps.Marker({
          map: map,
          draggable: true,
          position: {lat: 48.857, lng: 2.352}
        });
		/*zoomChangeBoundsListener = google.maps.event.addListener(map, 'bounds_changed', function(event) {
					//static var update=0;
					if (updatezoom==0 && this.getZoom()>0){
						//console.log("bounds"+this.getZoom());
						this.setZoom(this.getZoom()-1);
						updatezoom=1;
					}
					//console.log("Zoom: "+this.getZoom());
		});
        newBounds();*/
		
		var iconBase = 'img/';
        size=[100/0.65,85/0.65,100/0.9,85/0.9];
        var icoSize=new google.maps.Size(size[0], size[1]);
        var icoCent=new google.maps.Point(size[0]/2, size[1]/2);
        icons = {
		  marker1ico: {
            icon: {url: iconBase+"heart_g_s.png",
			scaledSize:  new google.maps.Size(size[2], size[3]),
			anchor: new google.maps.Point(size[2]/2, size[3]*0.75)}},
		  marker2ico: {
            icon: {url: iconBase+"heart_b_s.png",
			scaledSize:  new google.maps.Size(size[2], size[3]),
			anchor: new google.maps.Point(size[2]/2, size[3]*0.75)}},
		  together: {
            icon: {url: iconBase+"heart_s.png",
			scaledSize:  new google.maps.Size(size[0], size[1]),
			anchor: new google.maps.Point(size[0]/2, size[0]*0.75)}}
		};
		
        google.maps.event.addListener(marker1, 'position_changed', update);
        google.maps.event.addListener(marker2, 'position_changed', update);
        /*
        poly = new google.maps.Polyline({
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 3,
          map: map,
        });*/

        geodesicPoly = new google.maps.Polyline({
          strokeColor: '#CC0000',
          strokeOpacity: 1.0,
          strokeWeight: 3,
          geodesic: true,
          map: map
        });
        route=getSimpleFineData(marker1.getPosition(), marker2.getPosition(),60);
        update();
        //tick();
      }

      function update() {
        var dist = google.maps.geometry.spherical.computeDistanceBetween(marker1.getPosition(), marker2.getPosition());
        if (dist>20){
			var path = [marker1.getPosition(), marker2.getPosition()];
			geodesicPoly.setPath(path);
			//marker1.setAnimation(null);
			//marker2.setAnimation(null);
			marker1.setIcon(icons['marker1ico'].icon);
			marker2.setIcon(icons['marker2ico'].icon);
		}else{
			//marker1.setAnimation(google.maps.Animation.BOUNCE);
			//marker2.setAnimation(google.maps.Animation.BOUNCE);
			marker1.setIcon(icons['together'].icon);
			marker2.setIcon(icons['together'].icon);

			geodesicPoly.setPath([]);
		}
        mapAdjustment(marker1,marker2);
        document.getElementById('distance').innerHTML = Math.floor(dist / 1000).toString();
        //dist2Color(dist/1000,ticker);
      }
      
      function updateContent(posM1,posM2,date,ortM1,ortM2,partTogether,totalTogether,zoom){
		if (date!="" && document.getElementById('date').innerHTML!=date){
			document.getElementById('date').innerHTML=date;
		}
		if (posM1!="" &&(marker1.getPosition().lat()!=posM1.lat || marker1.getPosition().lng()!=posM1.lng)){
			marker1.setPosition(posM1);
		}
		if (posM2!="" &&(marker2.getPosition().lat()!=posM2.lat || marker2.getPosition().lng()!=posM2.lng)){
			marker2.setPosition(posM2);
		}
		if (ortM1!="" && document.getElementById('marker1').innerHTML!=ortM1){
			document.getElementById('marker1').innerHTML=ortM1;
			//newBounds();
		}
		if (ortM2!="" && document.getElementById('marker2').innerHTML!=ortM2){
			document.getElementById('marker2').innerHTML=ortM2;
			//newBounds();
		}
		if (partTogether!="" && document.getElementById('together').innerHTML!=partTogether){
			document.getElementById('together').innerHTML=partTogether;
		}
		if (totalTogether!="" && document.getElementById('totaltogether').innerHTML!=totalTogether){
			document.getElementById('totaltogether').innerHTML=totalTogether;
		}
		if (zoom!="" && map.getZoom()!=zoom){
			map.setZoom(zoom);
		}
	  }
      function tick1(t) {
		//try{
		ticker=t;
		//console.log("tick: "+ticker);
		
		var date=displayDate(pathM2[ticker].date);
		updateContent(pathM1[ticker].position,pathM2[ticker].position,date,pathM1[ticker].ort,pathM2[ticker].ort,pathM1[ticker].together,pathM1[ticker].total,pathM1[ticker].zoom);
		
		//marker1.setPosition(route[ticker]);
		
       }
       function tick() {
		   
            document.getElementById("slid").value=ticker;
            tick1(ticker);
            if (++ticker < pathM1.length && !autostop){
				autostop=false;
				setTimeout(tick, 1000/ticksPerSecond);
			}
       }
       
       function getSimpleFineData(latLngA,latLngB, steps) {
        var fineData = [];
        var step= 1 / steps;
        for (var j = 0; j <= steps; j++) {
            var interpolated = google.maps.geometry.spherical.interpolate(
					new google.maps.LatLng(latLngA.lat, latLngA.lng), new google.maps.LatLng(latLngB.lat, latLngB.lng), step * j);
            fineData.push(interpolated);
        }
        return fineData;
      }
       function getFineData(roughData, resolution) {
		   /*
		   by: https://gist.github.com/zhenyanghua/1658fa3d6ac5bb8d3176
		   */
        var fineData = [];
        var latLngA;
        var latLngB;
        var steps;
        var step;
        for (var i = 1; i < roughData.length; i++) {
          latLngA = roughData[i - 1];
          latLngB = roughData[i];
          distanceDiff = google.maps.geometry.spherical.computeDistanceBetween(latLngA, latLngB);
          steps = Math.ceil(distanceDiff / resolution);
          step = 1 / steps;
          previousInterpolatedLatLng = latLngA;
          for (var j = 0; j <= steps; j++) {
            var interpolated = google.maps.geometry.spherical.interpolate(
					new google.maps.LatLng(latLngA.lat, latLngA.lng), new google.maps.LatLng(latLngB.lat, latLngB.lng), step * j);
            fineData.push(interpolated);
          }
        }
        return fineData;
      }
      
      function handleFileSelect_Marker1(evt) {
		ortArrayM1=[];
		generatePathFromFile(evt,ortArrayM1,"M1");
	  }
	  function handleFileSelect_Marker2(evt) {
		ortArrayM2=[];
		generatePathFromFile(evt,ortArrayM2,"M2");
	  }
	  function generatePathFromFile(evt,tmppath,name){
		var files = evt.target.files; // FileList object
		var reader = new FileReader();
		reader.onload = function(e) {
			// Print the contents of the file
			text = e.target.result;
			console.log(text);
			var dataArray=[];
			var lines = text.split(/[\r\n]+/g); // tolerate both Windows and Unix linebreaks
			//var lines =text.split(",");
			for (var i=0;i<lines.length;i++){
				var values=lines[i].split(';');
				if(values[0]=="destination_name"||lines[i]==""){
					continue;
				}
				if (values.length>=7){
					elem={id: i,
						name: values[0].trim(),
						lng: parseFloat(values[1].trim()),
						lat: parseFloat(values[2].trim()),
						arrival: makeDate(values[3].trim()),
						departure: makeDate(values[4].trim()),
						defaultafter: values[5].trim(),
						display: values[6].trim()};
					dataArray.push(elem);
					//console.log(elem['name']+" "+elem['arrival']);
					if (!(elem.name in locationsLatLng)){
						if (values[1].trim()==""){
							console.log("Bad "+elem.name);
							locationsLatLng[elem.name]=dummyLatLng;
						}else{
							locationsLatLng[elem.name]={lat:elem.lat,lng:elem.lng};
						}
					}
				}
			}
			/*showall();
			document.getElementById('laden').innerHTML="laden";
			initMap();*/
			makeTravelEvents(dataArray,tmppath);
			if (name=="M1"){
				updateContent(locationsLatLng[dataArray[0].defaultafter],"","Start",dataArray[0].defaultafter,"",0,"","");
				document.getElementById('dataValM1').innerHTML=":-)";
			}else if (name=="M2"){
				updateContent("",locationsLatLng[dataArray[0].defaultafter],"Start","",dataArray[0].defaultafter,0,"","");
				document.getElementById('dataValM2').innerHTML=":-)";
			}
			//path=generatePath(ortarray);
			
			//console.log("tmppath");
			//console.log(tmppath);
			console.log("ortArrayM1");
			console.log(ortArrayM1);
			console.log("ortArrayM2");
			console.log(ortArrayM2);
			

		};
		reader.readAsText(files[0],"UTF-8");
	  }
	  function generateLocationsFromFile(evt){
		var files = evt.target.files; // FileList object
		var reader = new FileReader();
		reader.onload = function(e) {
			// Print the contents of the file
			text = e.target.result;
			console.log(text);
			var dataArray=[];
			var lines = text.split(/[\r\n]+/g); // tolerate both Windows and Unix linebreaks
			//var lines =text.split(",");
			for (var i=0;i<lines.length;i++){
				var values=lines[i].split(';');
				if(values[0]=="destination_name"||lines[i]==""){
					continue;
				}
				if (values.length>=3){
					elem={id: i,
						name: values[0].trim(),
						lng:parseFloat(values[1].trim()),
						lat: parseFloat(values[2].trim())};
					dataArray.push(elem);
					//console.log(elem['name']+" "+elem['lat']);
					if (!(elem.name in locationsLatLng)){
						locationsLatLng[elem.name]={lat:elem.lat,lng:elem.lng};
					}
				}
			}
			document.getElementById('orteVal').innerHTML=":-)";
		};
		reader.readAsText(files[0],"UTF-8");
	  }
	  
	  function makeTravelEvents(array,travelarray){
		  //array=farray;
		  for (e in array){
			  var disp="";
			  if (array[e].display==""){
				  disp=array[e].name;
			  }else{
				  disp=array[e].display;
			  }
			  travelarray.push({
				  name: disp,
				  latlng: locationsLatLng[array[e].name],
				  date: array[e].arrival,
				  default: false
			  });
			  if (array[e].defaultafter!=""){
				  travelarray.push({
					  name: array[e].defaultafter,
					  latlng: locationsLatLng[array[e].defaultafter],
					  date: array[e].departure,
					  default: true
				  });
			  }
			  
		  }
		  /*for (i in travelarray){
			  console.log(travelarray[i].date+" "+travelarray[i].name+" "+travelarray[i].latlng.lat+" "+travelarray[i].latlng.lng);
		  }*/
			return travelarray;
			
	  }
		function fillFine(last,next,path,date,stepsForFly,togetherDays,totalDays,zoomArr){
			if (next==0){
				//console.log("empty?");
				for (st=0;st<stepsForFly;st++){
					path.push({ort:last.name,'date':date,position:last.latlng,together:togetherDays,total:totalDays,zoom:zoomArr[st]});
				}
			}else{
				var fine1=getSimpleFineData(last.latlng,next.latlng, stepsForFly);
				//console.log(date+" "+last.name+" "+next.name+" "+zoomArr[0]+" "+zoomArr[zoomArr.length-1]);
				var j=0;
				var end=0;
				var name="";
				if (next.default){
					name=last.name;
					end=1;
				}else{
					name=next.name;
				}
				for (j;j<stepsForFly-end;j++){
					path.push({ort: name,date:date,position:{lat:fine1[j].lat(),lng:fine1[j].lng()},together:togetherDays,total:totalDays,zoom:zoomArr[j]});
				}
				if (next.default){
					path.push({ort: next.name,date:[],position:{lat:fine1[j].lat(),lng:fine1[j].lng()},together:togetherDays,total:totalDays,zoom:zoomArr[j]});
				}
			}
		}
		function calcDist(pos1,pos2){
			var pos1g=new google.maps.LatLng(pos1.lat, pos1.lng);
			var pos2g=new google.maps.LatLng(pos2.lat, pos2.lng);
			return google.maps.geometry.spherical.computeDistanceBetween(pos1g, pos2g)/1000.0;
		}
		function calcStepFactor(lastPos1,nextPos1,lastPos2,nextPos2){
			var d1=0;
			var d2=0;
			//lastPos1g=new google.maps.LatLng(lastPos1.lat, lastPos1.lng);
			//lastPos2g=new google.maps.LatLng(lastPos2.lat, lastPos2.lng);
			if (nextPos1!=0){
				
				//nextPos1g=new google.maps.LatLng(nextPos1.lat, nextPos1.lng);
				//d1=google.maps.geometry.spherical.computeDistanceBetween(lastPos1g, nextPos1g)/1000;
				d1=calcDist(lastPos1,nextPos1);
			}
			if (nextPos2!=0){
				//nextPos2g=new google.maps.LatLng(nextPos2.lat, nextPos2.lng);
				//d2=google.maps.geometry.spherical.computeDistanceBetween(lastPos2g, nextPos2g)/1000;
				d2=calcDist(lastPos2,nextPos2);
			}
			var dtrav=Math.max(d1,d2);
			//var ddist=Math.max(500,google.maps.geometry.spherical.computeDistanceBetween(lastPos1g, lastPos2g)/1000);
			var ddist=calcDist(lastPos1,lastPos2);
			var fac=Math.max(1/2,Math.min(3,dtrav/ddist));
			return fac;
		}
		function calcZoomSteps(pos1,pos2,pos3,oldzoom,steps,last=false){
			pos1g=new google.maps.LatLng(pos1.lat, pos1.lng);
			pos2g=new google.maps.LatLng(pos2.lat, pos2.lng);
			pos3g=new google.maps.LatLng(pos3.lat, pos3.lng);
			//var absdist = google.maps.geometry.spherical.computeDistanceBetween(pos1g, pos2g)/1000;
			var absdist = calcDist(pos1,pos2);
			//var traveldist = google.maps.geometry.spherical.computeDistanceBetween(pos1g, pos3g)/1000;
			var traveldist = calcDist(pos1,pos3);
			var distfac=1;
			if (absdist>300){
				if (pos1.lat-pos2.lat==0){
					distfac=3;
				}else{
					distfac=1+3*Math.atan(Math.abs((pos1.lat-pos2.lat)/(pos1.lng-pos2.lng)))/3.14159;
				}
			}
			
			var dist=absdist*distfac;
			var zoom=5;
			if (last){
				zoom=11;
			}else if (dist>6000){
				zoom=3;
			}else if(dist>4000){
				zoom=4;
			}else if(dist>2000){
				zoom=5;
			}else if (dist>1000){
				zoom=6;
			}else if (dist==0){
				zoom=7;
			}else{
				zoom=7;
			}
			//console.log(absdist+" "+ distfac+" "+zoom);
			var zoomArr=[];
			if (traveldist<dist*10 || traveldist<3000){
				for (var i=0;i<steps;i++){
					zoomArr.push(Math.floor(oldzoom+i*(zoom-oldzoom)/steps));
				}
			}else{
				for (var i=0;i<Math.floor(steps/2.0);i++){
					zoomArr.push(Math.floor(oldzoom+i*(zoom-2.1-oldzoom)/(steps/2)));
				}
				for (var i=0;i<Math.ceil(steps/2.0);i++){
					zoomArr.push(Math.floor((zoom-2)+i*2/(steps/2)));
				}
			}
			return zoomArr;
		}
		
		function mapAdjustment(marker1,marker2){
			var lat1=(marker1.getPosition().lat()+marker2.getPosition().lat())/2.0;
			var lng1=(marker1.getPosition().lng()+marker2.getPosition().lng())/2.0;
			var center={lat:lat1,lng:lng1};
			map.setCenter(center);
		}
		
		function generatePath(){
			//document.getElementById('slider').style.bottom="-50px";
			showhideControls();
			//console.log(ortArrayM1);
			//console.log(ortArrayM2);
			var landmarksM1=ortArrayM1.slice();
			var landmarksM2=ortArrayM2.slice();
			pathM1=[];
			pathM2=[];
			togetherDays=0;
			totalDays=0;
			var pelem={ort:"bla", date:[2010,6,12], position:{lat: 40.714, lng: -74.006},together:10,total:10,zoom:1,dist:0,avdist:0};
			//var landmarks=makeTravelEvents().slice();
			var tpd=ticksPerSecond;
			//var start=[2011,1,1];
			var date=start.slice();
			//var end=[2018,06,10];
			//var fastDayRate=1; //ticks to complete a day
			//var slowDayRate=1/4;
			var dayRate=fastDayRate;
			//var stepsForFly=15;
			var lastDestM1={name: landmarksM1[1].name, latlng: landmarksM1[1].latlng, date: start, default: true};
			var lastDestM2={name: landmarksM2[1].name, latlng: landmarksM2[1].latlng, date: start, default: true};
			var nextDestM1=landmarksM1[0];//landmarksM1.shift();
			var nextDestM2=landmarksM2[0];//landmarksM2.shift();
			var timer=0;
			var togetherDays=0;
			var olddate=0;
			var fzoom=5;
			var distance=0;
			while (smallerDate(date,end) && timer<100000){
				timer++;
				var last=((landmarksM1.length==0 && nextDestM2==0) || (landmarksM2.length==0 && nextDestM1==0) || equalDate(date,end));
				if (nextDestM1!=0 && equalDate(date,nextDestM1.date)){
					
					//console.log("1?2:"+nextDestM2.date+" "+nextDestM1.date);
					if (nextDestM2!=0 && equalDate(date,nextDestM2.date)){
						//fly both
						distance = calcDist(nextDestM2.latlng,nextDestM2.latlng);
						stepsForFly=defStepsForFly*calcStepFactor(lastDestM1.latlng,nextDestM1.latlng,lastDestM2.latlng,nextDestM2.latlng);
						if (last){stepsForFly=stepsForFly*3;}
						zoomArr=calcZoomSteps(nextDestM1.latlng,nextDestM2.latlng,lastDestM1.latlng,fzoom,stepsForFly,last);
						//zoomArr=calcZoomSteps(nextDestM1.latlng,nextDestM2.latlng,lastDestM1.latlng,fzoom,stepsForFly);
						fzoom=zoomArr[zoomArr.length - 1];
						fillFine(lastDestM1,nextDestM1,pathM1,date,stepsForFly,togetherDays,totalDays,zoomArr);
						fillFine(lastDestM2,nextDestM2,pathM2,date,stepsForFly,togetherDays,totalDays,zoomArr);
						lastDestM2=nextDestM2;
						if (landmarksM2.length==0){nextDestM2=0;}else{nextDestM2=landmarksM2.shift();}
					}else{
						//fly M1
						stepsForFly=defStepsForFly*calcStepFactor(lastDestM1.latlng,nextDestM1.latlng,lastDestM2.latlng,0);
						if (last){stepsForFly=stepsForFly*3;}
						zoomArr=calcZoomSteps(nextDestM1.latlng,lastDestM2.latlng,lastDestM1.latlng,fzoom,stepsForFly,last);
						fzoom=zoomArr[zoomArr.length - 1];
						fillFine(lastDestM1,nextDestM1,pathM1,date,stepsForFly,togetherDays,totalDays,zoomArr);
						//fill M2 empty
						fillFine(lastDestM2,0,pathM2,date,stepsForFly,togetherDays,totalDays,zoomArr);
					}
					lastDestM1=nextDestM1;
					if (landmarksM1.length==0){nextDestM1=0;}else{nextDestM1=landmarksM1.shift();}
					
				}else if (nextDestM2!=0 && equalDate(date,nextDestM2.date)){
					//console.log("2:"+nextDestM2.date);
					//fly
					
					stepsForFly=defStepsForFly*calcStepFactor(lastDestM1.latlng,0,lastDestM2.latlng,nextDestM2.latlng);
					if (last){stepsForFly=stepsForFly*3;}
					zoomArr=calcZoomSteps(lastDestM1.latlng,nextDestM2.latlng,lastDestM1.latlng,fzoom,stepsForFly,last);
					fzoom=zoomArr[zoomArr.length - 1];
					fillFine(lastDestM2,nextDestM2,pathM2,date,stepsForFly,togetherDays,totalDays,zoomArr);
					//fill M1 empty
					fillFine(lastDestM1,0,pathM1,date,stepsForFly,togetherDays,totalDays,zoomArr);
					lastDestM2=nextDestM2;
					if (landmarksM2.length==0){nextDestM2=0;}else{nextDestM2=landmarksM2.shift();}
				}else{
					if ((nextDestM1!=0 && smallerDate(nextDestM1.date,date)) || (nextDestM2!=0 && smallerDate(nextDestM2.date,date))){
						console.log("Error"+date+" "+nextDestM1.date+" "+nextDestM2.date);
					}
					//console.log("nix "+date+" "+lastDestM1.date+" "+lastDestM2.date);
					pathM1.push({ort: lastDestM1.name,date:date,position:lastDestM1.latlng,together:togetherDays,total:totalDays,zoom:fzoom});
					pathM2.push({ort: lastDestM2.name,date:date,position:lastDestM2.latlng,together:togetherDays,total:totalDays,zoom:fzoom});
					//console.log("Nix:"+nextDestM2.date);
					olddate=date.slice();
					date=dateAddDay(date,dayRate);
					if (Math.floor(olddate[2])<Math.floor(date[2])){
						totalDays++;
						if (calcDist(lastDestM1.latlng,lastDestM2.latlng)<50){
							//todo dist calculation
							togetherDays++;
						}
					}
					
					
				}
				if (!lastDestM1.default || !lastDestM2.default){
					dayRate=slowDayRate;
				}else{
					dayRate=fastDayRate;
				}
			}
			console.log("Anzahl timer: "+timer+" "+fzoom);
			console.log("Länge der Paths: "+ pathM1.length+" " +pathM2.length);
			
			document.getElementById('slid').max=pathM1.length;
			ticker=0;
			document.getElementById("slid").value=ticker;
			
			printCanvas();
			
			tick1(ticker);
			document.getElementById('genPaths').innerHTML=":-)";
			//document.getElementById('totaltogether').innerHTML=totalDays;
			
			  document.getElementById('title_orig').style.fontsize="10px";
			  document.getElementById('title_trans').style.fontsize="10px";
			
			return 0;
		}
		
		function printCanvas(){
			
		  var canvas = document.getElementById("canvas");
		  canvas.width=6000;//pathM1.length/1;
		  canvas.height=200;
		  var context = canvas.getContext("2d");
		  
			var fac=pathM1.length/canvas.width;
			
			for (i=0;i<canvas.width;i++){
				var d=0;
				var dm=100000;
				var dav=0;
				for (j=Math.floor(fac*i);j<Math.floor(fac*(i+1));j++){
					d=calcDist(pathM1[j].position,pathM2[j].position);
					dav=dav+d;
					if (d<dm){dm=d;}
				}
				
				dist2Color(context,(dav/fac),i,d/(dav/fac));
			}
			context.font = "150px Roboto";
			var oyear=0;
			context.fillStyle = "rgba("+0+","+0+","+0+","+0.7+")";
			for (i=0;i<canvas.width;i++){
				if (pathM1[Math.floor(fac*i)].date[0]>oyear){
					oyear=pathM1[Math.floor(fac*i)].date[0];
					context.fillText(oyear,i,canvas.height); 
					//console.log(oyear);
				}
			}
		}
		
		function dist2Color(context,dist,step,intens){
			var coldens=1-Math.atan(dist/500)/(3.1416/2);
			coldens=1-Math.min(2000,dist)/2000.0;//1-(Math.log(dist+1)-1)/9;//
			//console.log(dist+" "+coldens);
			context.fillStyle = "rgba("+255+","+coldens*0+","+coldens*0+","+(1-coldens)+")";
			context.fillRect(step, 0, 1, canvas.height);
		}
      
