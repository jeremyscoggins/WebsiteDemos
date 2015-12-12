window.onload = function(){
	var canvas, context, palette = [], max_iteration = 512, px = 0, py = 0, height, width, lineData = null;
	function setPixel(r,g,b,a,x,y)
	{
		if(!lineData)
		{
			lineData = context.createImageData(width, 1); // only do this once per page
		}
		var d  = lineData.data;                        // only do this once per page
		var offset = x*4;
		d[offset + 0]   = r;
		d[offset + 1]   = g;
		d[offset + 2]   = b;
		d[offset + 3]   = a;
		if(x == width - 1 )
		{
			context.putImageData( lineData, 0, y );     	
			//lineData = null;
		}
		/*
		context.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
		context.fillRect( x, y, 1, 1 );
		*/
	}
	
	function scale(input, min1, max1, min2, max2)
	{
		range1 = (max1 - min1); 
		range2 = (max2 - min2);
		return (((input - min1) * range2) / range1) + min2;
	}
	
	function clamp(input, min, max)
	{
		return Math.round(Math.max(Math.min(input, max), min));
	}
	
	function makeColorGradient(frequency1, frequency2, frequency3,
							 phase1, phase2, phase3,
							 center, width, len)
	{
		var result = [];
		if (center == undefined)   center = 128;
		if (width == undefined)    width = 127;
		if (len == undefined)      len = 50;

		for (var i = 0; i < len; ++i)
		{
		   var red = Math.sin(frequency1*i + phase1) * width + center;
		   var grn = Math.sin(frequency2*i + phase2) * width + center;
		   var blu = Math.sin(frequency3*i + phase3) * width + center;
		   result[i] = [red,grn,blu, 255];
		}
		return result;
	}
	
	function draw()
	{
		var x0 = scale(px, 0, canvas.width, -2.5, 1); //scaled x coordinate of pixel (scaled to lie in the Mandelbrot X scale (-2.5, 1))
		var y0 = scale(py, 0, canvas.width, -1, 1);//scaled y coordinate of pixel (scaled to lie in the Mandelbrot Y scale (-1, 1))
		var x = 0.0;
		var y = 0.0;
		var iteration = 0;
		while ( x*x + y*y < 2*2  &&  iteration < max_iteration )
		{
			var xtemp = x*x - y*y + x0;
			y = 2*x*y + y0;
			x = xtemp;
			iteration = iteration + 1;
		}
		var color = palette[iteration];
		setPixel(color[0],color[1],color[2],color[3],px,py);
		
		px++;
		if(px == width)
		{
			py++;
			px = 0;
		}
		if(px < width && py < height)
		{
			return true;
		}
		return false;
	}
	
	var colorClamp = function(i){ return clamp(i, 0, 255); };
	var colorScale = function(i, a, b) { return scale(i, 0, max_iteration, a, b); };
	var colorRange = Math.pow(2,8);
	
	var palette = makeColorGradient(.1,.1,.1,0,2,4, 127, 128, max_iteration+1);
	
	canvas = document.getElementById("canvas");
	context = canvas.getContext('2d');
	
	height = canvas.height;
	width = canvas.width;
	
	for(var y = 0; y < height; y++)
	{
		for(var x = 0; x < width; x++)
		{
			var color = palette[Math.floor(scale(x,0, width, 0, max_iteration))];
			setPixel(color[0],color[1],color[2],color[3],x,y);
		}
	}

	///*
	var doDraw = function()
	{
		var keepDrawing = true;
		do
		{
			keepDrawing = draw();
		} while (keepDrawing && px > 0);
		if(keepDrawing)
			window.setTimeout(doDraw,0);
	};
	window.setTimeout(doDraw,2000);
	//*/
	
	return;
}