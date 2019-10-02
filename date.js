/*
 * Author: Sascha Schleef
 * Project: Distance Visualisation of two People
 * Year: 06/2018
 */


function dateAddDay(ymdIn,frac){
			ymd=ymdIn.slice();
			if (frac>1){
				return ymdIn;
			}else if (Math.floor(ymd[2]+frac)==Math.floor(ymd[2])){
				ymd[2]=ymd[2]+frac;
			}else if (Math.floor(ymd[2])==31 && (ymd[1]==1 || ymd[1]==3 || ymd[1]==5 || ymd[1]==7 || ymd[1]==8 || ymd[1]==10 || ymd[1]==12)){ 
				ymd[2]=(ymd[2]-Math.floor(ymd[2]))+frac;
				if (ymd[1]==12){
					ymd[0]++;
					ymd[1]=1;
				}else{
					ymd[1]=ymd[1]+1;
				}
			}else if (Math.floor(ymd[2])==30 && (ymd[1]==4 || ymd[1]==6 || ymd[1]==9 || ymd[1]==11 )){
				ymd[2]=(ymd[2]-Math.floor(ymd[2]))+frac;;
				ymd[1]=ymd[1]+1;
			}else if (ymd[1]==2 && (Math.floor(ymd[2])==28 || Math.floor(ymd[2])==29)){
				if (Math.floor(ymd[2])==28 && ((ymd[0]%4==0 && ymd[0]%100!=0) || ymd[0]%400==0)){
					ymd[2]+=frac;
				}else{
					ymd[2]=(ymd[2]-Math.floor(ymd[2]))+frac;
					ymd[1]=3;
				}
			}else{
				ymd[2]+=frac;
			}
			if (frac!=1){
				ymd[2]+=0.00000000000001;
			}
			return ymd;
		}
		function dateAddDays(ymd,days){
			for (i=0;i<Math.floor(days);i++){
				ymd=dateAddDay(ymd,1);
			}
			ymd=dateAddDay(ymd,days-Math.floor(days));
			return ymd;
		}
		function smallerDate(d1,d2){
			/*if (d1[0]<d2[0] || (d1[0]==d2[0] && d1[1]<d2[1]) || (d1[0]==d2[0] && d1[1]==d2[1] && d1[2]<d2[2])){
				return true;
			}else{
				return false;
			}*/
			return (d1[0]<d2[0] || (d1[0]==d2[0] && d1[1]<d2[1]) || (d1[0]==d2[0] && d1[1]==d2[1] && d1[2]<d2[2]));
		}
		function equalDate(d1,d2,fl=true){
			if (fl){
				return (d1[0]==d2[0] && d1[1]==d2[1] && Math.floor(d1[2])==Math.floor(d2[2]));
			}else{
				return (d1[0]==d2[0] && d1[1]==d2[1] && d1[2]==d2[2]);
			}
		}
	  function produce_lin_data(){
		  var d1=new Date(1990,1,31);
		  var d2=new Date(2018,10,12);
		  var dif=d2-d1;
		  
		  var d3=new Date(d1);
		  d3.setDate(d3.getDate()+parseInt(1));
		  console.log(dif.toString());
		  console.log(d1);
		  console.log(d3);
		  ymd1=[2011,6,27];
		  console.log(ymd1);
		  for (i=0;i<20;i++){
				ymd1=dateAddDay(ymd1,0.2);
				console.log(ymd1);
			}
		  console.log(equalDate([2012,12,2],[2012,12,3]));
		  var bla=[1,2,3,4,5];
		  for ( i in [1,2,3,4,5,6]){
			  console.log(bla.shift());
		  }
		  
	  }
	  function displayDate(date){
		  if (date.length<3){
			  return "";
		  }else{
			  var d=Math.floor(date[2]);
			  var m=date[1];
			  var dateD="";
			  console.log(date);
			  if (d<10){
				  dateD+="0"+d.toString()+".";
			  }else{
				  dateD+=d.toString()+".";
			  }
			  if (m<10){
				  dateD+="0"+m.toString()+".";
			  }else{
				  dateD+=m.toString()+".";
			  }
			  dateD+=date[0].toString();
			  return dateD;
		  }
	  }
	  
	  function makeDate(str){
		  var arr=[];
		  if (str.includes(".")){
			  arr=str.split(".").reverse();
		  }else{
			  arr= str.split("-");
		  }
		  return [parseFloat(arr[0]),parseFloat(arr[1]),parseFloat(arr[2])];
	  }
	  function testing(){
		zoomArr=calcZoomSteps({lat:0.0,lng:0.0},{lat:10.0,lng:30},1,10);
		console.log(zoomArr);
		console.log(zoomArr[zoomArr.length - 1]);
		fak=calcStepFactor({lat:0,lng:0},{lat:2,lng:0},{lat:0,lng:10},0);
		console.log(fak);
	  }
	  /*class daycounter{
		  var start=new Date(2010,6,12);
		  var end=new Date(2018,6,12);
		  function addDays(date, days) {
			  var result = new Date(date);
			  result.setDate(result.getDate() + days);
			  return result;
			}
	  }*/
	  function dict(){
		  var bla=new Array();
		  bla["Bielefeld"]=[1,2];
		  if ("Bielefeld" in bla){
			console.log(bla["Bielefeld"][0]);
		}
	  }
		//produce_lin_data();
		//generatePath();
