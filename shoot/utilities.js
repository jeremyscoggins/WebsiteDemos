	/*
	var sinTable = [];
	for(x=0;x<3650;x++)
		sinTable[x]=Math.sin(deg2rad(x/10));
	var cosTable = [];
	for(x=0;x<3650;x++)
		cosTable[x]=Math.cos(deg2rad(x/10));
	*/

	function constrain(angle){
		if(angle>360)
			return angle-360;
		if(angle < 0)
			return angle+360;
		return angle;
	}
	function Chr(num){
		return String.fromCharCode(num);
	}
	function pad(number, length) {
	   
	    var str = '' + number;
	    while (str.length < length) {
	        str = '0' + str;
	    }
	   
	    return str;
	
	}	
	function deg2rad(deg){
		return deg * Math.PI / 180;
	}
	function rad2deg(rad){
		var out= rad * 180 / Math.PI;
		if(out < 0)
			out=out+360;
		return out;
	}
	function calcvector(dir,dist){
		return{
			xv:Math.cos(deg2rad(dir))*dist,
			yv:Math.sin(deg2rad(dir))*dist
		};
		/*return{
			xv:cosTable[Math.round(dir*10)]*vel,
			yv:sinTable[Math.round(dir*10)]*vel
		};*/
	}	
	function calcvector2(x,y,x2,y2,dist){
			var distsqr = calcdistsquared(x, y, x2, y2);
			var scale = dist * -1;
			var oodist = 1.0 / (dist*dist);
			return{
				xv:(x2 - x) * oodist * scale,
				yv:(y2 - y) * oodist * scale
			};
	}	
	function calcdir(x, y, x2, y2){
		return rad2deg(Math.atan2(y2-y,x2-x));
	}
	function calcdist(x, y, x2, y2){
		var deltaY=y2-y;
		var deltaX=x2-x;
		return Math.sqrt(deltaY*deltaY+deltaX*deltaX);
	}
	function calcdistsquared(x, y, x2, y2){
		var deltaY=y2-y;
		var deltaX=x2-x;
		return deltaY*deltaY+deltaX*deltaX;
	}

Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
};







