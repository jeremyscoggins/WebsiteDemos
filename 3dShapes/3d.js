//derived from http://www.canonical.org/~kragen/sw/torus.html
(function(window){
	var canvas,
	context,
	go = true,
	solid = true,
	translucent = false,
	trails = false,
	w,
	h,
	torus,
	framerate = 60,
	frameMS = 1000/framerate,
	timeScale = (1000-frameMS)/5,
	xyScale = 3;
	angle = 0,
	fillColor = 'black',
	lineColor = 'grey',
	time = 0,
	animate =true,
	currentShape='icosphere',
	lightMin = 32,
	lightMax = 255;
	
	// === basic wheel reinvention stuff ===
	
	function $(id) {
		return document.getElementById(id);
	}
	
	// comparison function using a key, to pass to .sort()
	function keycomp(key) {
	  return function(a, b) {
		var ka = key(a);
		var kb = key(b);
		if (ka < kb) return -1;
		if (ka > kb) return 1;
		return 0;
	  }
	}
	function distinct(lines)
	{
		var lDict = {}, lines2 = [];
		for(var l =0; l< lines.length; l++)
		{
			var line = lines[l];
			if(line[0] > line[1])
			{
				var temp = line[0];
				line[0] = line[1];
				line[1] = temp;
			}
			if(lDict.hasOwnProperty(line))
			{
				continue;
			}
			lines2.push(line);
			lDict[line] = true;
		}
		return lines2;
	}
	
	
	// return a list transformed by a function
	function map(f, list) {
	  var rv = [];
	  for (var ii = 0; ii < list.length; ii++)
	  {
		  rv.push(f(list[ii]));
	  }
	  return rv;
	}
	
	// === 3d transforms ===
	
	// We represent transforms as a 3x4 list of lists (ahem, array of arrays):
	// [[x_from_x, x_from_y, x_from_z, x_off],
	//  [y_from_x, y_from_y, y_from_z, y_off],
	//  [z_from_x, z_from_y, z_from_z, z_off]]
	// And we only actually multiply points through them in xform.
	function translate(x, y, z) {
	  return [[1, 0, 0, x], [0, 1, 0, y], [0, 0, 1, z]];
	}
	function identity() {
		return translate(0, 0, 0);
	}
	// rotation around the Z-axis
	function rotate(theta) {
	  var s = Math.sin(theta);
	  var c = Math.cos(theta);
	  return [[c, -s, 0, 0], [s, c, 0, 0], [0, 0, 1, 0]];
	}
	// exchange two of the X, Y, Z axes --- useful for making rotate() go around
	// another axis :)
	function transpose_axes(a, b) {
	  var rv = identity();
	  var tmp = rv[a];
	  rv[a] = rv[b];
	  rv[b] = tmp;
	  return rv;
	}
	// you'd think we'd have a scale() function too, but I haven't needed it yet.
	// concatenate two transforms --- the magic that makes it all possible
	function concat(x1, x2) {
	  var rv = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
	  for (var ii = 0; ii < 3; ii++) {
		rv[ii][3] = x2[ii][3];
		for (var jj = 0; jj < 3; jj++) {
		  rv[ii][3] += x1[jj][3] * x2[ii][jj];
		  for (var kk = 0; kk < 3; kk++) {
			rv[ii][jj] += x1[kk][jj] * x2[ii][kk];
		  }
		}
	  }
	  return rv;
	}
	// concatenate N transforms.  I'd insert a special case for 0 transforms,
	// but amusingly this function isn't all that performance-critical.
	function concat_n(xforms) {
	  var rv = identity();
	  for (var ii = 0; ii < xforms.length; ii++) rv = concat(rv, xforms[ii]) 
	  return rv;
	}
	// transform a point.
	function xform(xform, p) {
	  var result_vec = []
	  for (var ii = 0; ii < 3; ii++) {
		var rv = xform[ii][3]
		for (var jj = 0; jj < 3; jj++) rv += xform[ii][jj] * p[jj]
		result_vec.push(rv)
	  }
	  return result_vec
	}
	// transform multiple points.
	function xform_points(xf, points) {
	  var xp = []
	  for (var ii = 0; ii < points.length; ii++) {
		xp.push(xform(xf, points[ii]))
	  }
	  return xp
	}
	// perspective-transform a point --- into 2d.
	function persp(p) { return [p[0] / p[2], p[1] / p[2]] }
	// perspective-transform multiple points
	function persp_points(points) {
	  return map(persp, points)
	}
	
	// return the normal of a triangle defined by three points.
	function normal(p1, p2, p3) {
	  var v1 = [p1[0]-p2[0], p1[1]-p2[1], p1[2]-p2[2]]
	  var v2 = [p2[0]-p3[0], p2[1]-p3[1], p2[2]-p3[2]]
	  var n = [v1[1]*v2[2]-v1[2]*v2[1], 
			   v1[2]*v2[0]-v1[0]*v2[2],
			   v1[0]*v2[1]-v1[1]*v2[0]]
	  var mag = Math.sqrt(n[0]*n[0] + n[1]*n[1] + n[2]*n[2])
	  return [n[0]/mag, n[1]/mag, n[2]/mag]
	}
	
	// === 3d shapes ===
	// We represent these as an array of three arrays
	// [points, lines, polies] where each line is two indices into the points array
	// and each poly is three indices into the points array
	
	function dup(array) {
	  var newarray = new Array(array.length)
	  for (var ii = 0; ii < array.length; ii++) newarray[ii] = array[ii]
	  return newarray
	}
	
	// transform a shape, returning a new shape
	function xform_shape(xf, shape) {
	  // de-alias new lines and polies
	  return [xform_points(xf, shape[0]), dup(shape[1]), dup(shape[2])]
	}
	
	// add a new shape onto an old shape, mutating the old one
	function augment(shape1, shape2) {
	  var s1p = shape1[0]
	  var off = s1p.length
	  for (var ii = 0; ii < shape2[0].length; ii++) s1p.push(shape2[0][ii])
	  var s2ll = shape2[1].length  // in case of aliasing
	  for (var ii = 0; ii < s2ll; ii++) 
		shape1[1].push([shape2[1][ii][0] + off, shape2[1][ii][1] + off])
	  var s2pl = shape2[2].length
	  for (var ii = 0; ii < s2pl; ii++) {
		var tri = shape2[2][ii]
		shape1[2].push([tri[0]+off, tri[1]+off, tri[2]+off])
	  }
	}
	
	// given a shape, make a more complicated shape by copying it through transform
	// xf n times, and connecting the corresponding points.  This is more powerful
	// than the usual kind of extrusion, and can be used to create fairly 
	// interesting shapes --- a snail shell from a circle, for instance.
	function extrude_shape(xf, shape, n) {
	  if (n == null) n = 1
	  var new_part = shape
	  var old_line_base = 0 // where the lines to attach the triangles start
	  for (var ii = 0; ii < n; ii++) {
		var new_part = xform_shape(xf, new_part)
		var shape_length = shape[0].length
		var new_line_base = shape[1].length  // for triangles later
		augment(shape, new_part)
		var new_part_length = new_part[0].length
		// connect corresponding points
		for (var jj = 0; jj < new_part_length; jj++) {
		  shape[1].push([shape_length + jj - new_part_length, shape_length + jj])
		}
		// make triangles
		var nlines = new_part[1].length
		// var old_line_base = new_line_base - nlines
		for (var jj = 0; jj < nlines; jj++) {
		  var old_line = shape[1][old_line_base + jj]
		  var new_line = shape[1][new_line_base + jj]
		  shape[2].push([old_line[0], old_line[1], new_line[0]])
		  shape[2].push([new_line[1], new_line[0], old_line[1]])
		}
		old_line_base = new_line_base
	  }
	}
	// a shape consisting of a single point
	function point_shape(x, y, z) { return [[[x, y, z]], [], []] }
	// approximate a circle in the x-y plane around the origin; radius r and n points
	function circle(r, n) {
	  var shape = point_shape(r, 0, 0)
	  extrude_shape(rotate(Math.atan(1)*8/n), shape, n)
	  return shape
	}
	// approximate a torus with major radius r2 and minor radius r1,
	// with correspondingly n2 and n1 points around each axis
	function make_torus(r1, r2, n1, n2) {
	  var c = xform_shape(translate(r2, 0, 0), circle(r1, n1))
	  extrude_shape(concat_n([transpose_axes(1, 2), 
							  rotate(Math.atan(1)*8/n2),
					  transpose_axes(1, 2)]),
			c, n2)
	  return c
	}
	function splitPoints(points)
	{
		var outPoints = [];
		for(var p =0; p< points.length; p+=3)
		{
			outPoints.push([points[p],points[p+1],points[p+2]])
		}
		return outPoints;
	}
	function scale(points, scale)
	{
		for(var p =0; p < points.length; p++)
		{
			points[p][0] = scale * points[p][0];
			points[p][1] = scale * points[p][1];
			points[p][2] = scale * points[p][2];
		}
	}
	function make_x3d_shape(xShape, xScale)
	{
		var points = splitPoints(map(function(p){return parseFloat(p);},xShape.points.split(" ")));
		var faceIndexes = xShape.faces.split(" ");
		var tris = [];
		var lines = [];
		for(var f =0; f < faceIndexes.length; f++)
		{
			var tri = [];
			do
			{
				tri.push(faceIndexes[f]);
				if(tri.length ==3)
				{
					tris.push(dup(tri));
				}
				else if(tri.length == 4)
				{
					tris.push([tri[2],tri[3],tri[0]]);
				}
				f++;				
			} while(faceIndexes[f] != -1);
		}
		for(var t = 0; t < tris.length; t++)
		{
			lines.push([tris[t][0],tris[t][1]]);
			lines.push([tris[t][1],tris[t][2]]);
			lines.push([tris[t][2],tris[t][0]]);
		}
		lines = distinct(lines);
		scale(points, xShape.defaultScale * xScale);
		return [points, lines, tris];
	}
	
	// === drawing code ===
	
	// draw a 3d shape on a canvas
	// 95% of the run time is in this function and its kids
	function draw_shape(context, xf, shape, alpha) {
	  //var ctx = canvas.getContext('2d')
	  //var w = canvas.width
	  //var h = canvas.height
	
	  // set up coordinate system so canvas is (-1, -1) to (1, 1)
	  context.save()
	  context.translate(w/2, h/2)
	  context.scale(w/2, h/2)  
	
	  // 1/3 of the time is in these two lines (when not doing polies)
	  var points3d = xform_points(xf, shape[0])
	  var points = persp_points(points3d)
	  var lines = shape[1]
	  // 2/3 of the time is in this loop (when we're not doing polies)
	  if (alpha == null) {
		context.strokeStyle = lineColor;
		context.lineWidth = 1/(w/2);
		context.beginPath()
		var p1, p2
		for (var ii = 0; ii < lines.length; ii++) {
		  p1 = points[lines[ii][0]]
		  p2 = points[lines[ii][1]]
		  context.moveTo(p1[0], p1[1])
		  context.lineTo(p2[0], p2[1])
		}
		context.stroke()
	  }
	
	  // when we're doing polies, 90% of our time is spent doing polies
	  if (alpha != null) {
		// Sort polygons by depth so we draw the farthest-away stuff first
		// ("painter's algorithm")
		var minusdepth = function(p) {
		  return [-(points3d[p[0]][2] + points3d[p[1]][2] + points3d[p[2]][2]), p] 
		}
		var polies = map(minusdepth, shape[2])
		polies.sort(keycomp(function(p) { return p[0] }))
	
		// draw all the polygons
		var tri, p1, p2, p3, n, bright
		for (var ii = 0; ii < polies.length; ii++) {
		  tri = polies[ii][1]
		  if (alpha == '1') {
			// light surface
		n = normal(points3d[tri[0]], points3d[tri[1]], points3d[tri[2]])
		// I'm not sure how to make backface removal work with perspective: 
		//if (n[2] > 0 && alpha == '1') continue // backface removal
	
		// lighting from (1, -1, -1) direction
		bright = Math.max(parseInt(((n[0]-n[1]-n[2]) / Math.sqrt(3) * lightMax)),lightMin);
		  } else {
			// lighting doesn't make sense if the object is transparent,
			// so we color by depth to have some variation in color...
			var maxd = polies[polies.length-1][0]
		var mind = polies[0][0]
		var d = polies[ii][0]
		bright = parseInt((d-mind)/(maxd-mind) * lightMax)
		  }
		  context.fillStyle = context.strokeStyle = 'rgba(' + bright + ',' + bright + ',' + bright + 
						  ',' + alpha + ')';
		  context.lineWidth = 1/(w/2);
		  context.beginPath();
		  p1 = points[tri[0]]
		  p2 = points[tri[1]]
		  p3 = points[tri[2]]
		  context.moveTo(p1[0], p1[1])
		  context.lineTo(p2[0], p2[1])
		  context.lineTo(p3[0], p3[1])
		  //context.closePath();//  seems to be unnecessary
		  context.fill();
		  context.stroke();
		}
	  }
	
	  context.restore()
	}
	// clear a canvas
	function cls(context) {
	  //var ctx = canvas.getContext('2d')
	  context.fillStyle = fillColor;
	  context.fillRect(0, 0, canvas.width, canvas.height)
	}
	
	// === drawing of particular shapes. also DOM. ===
	function unit_cube() {
	  var shape = point_shape(0, 0, 0)
	  extrude_shape(translate(0,0,1), shape)
	  extrude_shape(translate(0,1,0), shape)
	  extrude_shape(translate(1,0,0), shape)
	  return shape
	}
	
	// this was where I tested stuff as I wrote this
	function make_some_junk() {
	  // make a unit cube centered on the origin
	  var shape = xform_shape(translate(-0.5, -0.5, -0.5), unit_cube())
	
	  // add some circles
	  augment(shape, circle(0.707, 16))
	  augment(shape, xform_shape(transpose_axes(0, 2), circle(0.707, 16)))
	  augment(shape, xform_shape(transpose_axes(1, 2), circle(0.707, 16)))
	  augment(shape, circle(1, 15))
	
	  // add a disc
	  var big_disc = circle(2, 20)
	  extrude_shape(translate(0, 0, 0.5), big_disc, 2)
	  augment(shape, big_disc)
	  return shape
	}
	var some_junk = make_some_junk()
	
	function draw_some_junk(context) {
	  var xf = concat_n([transpose_axes(1, 2),
						 rotate(angle),
						 transpose_axes(1, 2),
				 rotate(angle*1.618),
				 translate(0, 0, 2.5)])
	
	  draw_shape(context, xf, some_junk)
	}
	function draw_torus(context) {
	  //var start = new Date()
	  var alpha = null;
	  if (solid)
	  {
	  	alpha = (translucent ? '0.5' : 1);
	  }
	  if (trails) {
		context.globalAlpha = 0.07;
	  } else {
		context.globalAlpha = 1;
	  }
	  draw_shape(context, concat_n([rotate(angle), 
						   transpose_axes(1, 2),
								   rotate(angle / 1.618),  // to reduce periodicity
								   transpose_axes(1, 2),
								   translate(0, 0, 6)]),
				 torus, alpha);
	  //var end = new Date()
	  /*var ms = $('ms')
	  if (ms) {
		var msvalue = ms.value + ' ' + (end.getTime() - start.getTime())
		if (msvalue.length > 25) msvalue = msvalue.substr(msvalue.length - 25)
		ms.value = msvalue
	  }*/
	}
	function tick() {
	  var start = new Date().getTime();
	  if (go)
	  {
	  	  if(animate && currentShape == 'plane')
	  	  {
			  for(var p =0; p< torus[0].length;p++)
			  {
			  	var point = torus[0][p];
				point[2] = ImprovedNoise.Generate3D(point[0]/xyScale,point[1]/xyScale,time/timeScale);
			  }
	  	  }
		  angle += 3.14159 / framerate / 10;
		  cls(context);
		  draw_torus(context);
	  }
	  if(animate)
	  {
		  time++;
	  }
	  setTimeout(tick, Math.max(frameMS-((new Date().getTime())-start),0));
	}
	function init(ev) {
	  //torus = make_torus(1, 3, 12, 12);
	  //torus = make_cube(1, 3, 12, 12);
	  //torus = make_icosphere(3);
	  torus = make_x3d_shape(shapes[currentShape], 1);
	  canvas = $('canvas');
	  context = canvas.getContext('2d');
	  w = canvas.width;
	  h = canvas.height;
	  $('go').checked = go;
	  $('go').onclick = function(e){
		go = this.checked;
	  }
	  $('fill').checked = solid;
	  $('fill').onclick = function(e){
		solid = this.checked;
	  }
	  $('translucent').checked = translucent;
	  $('translucent').onclick = function(e){
		translucent = this.checked;
	  }
	  $('trails').checked = trails;
	  $('trails').onclick = function(e){
		trails = this.checked;
	  }
	  $('shape').onchange = function(e){
	  	  go=false;
	  	  currentShape = this.options[this.selectedIndex].value;
		  torus = make_x3d_shape(shapes[currentShape], 1);
		  go = true;
	  }
	  $('animate').checked = animate;
	  $('animate').onclick = function(e){
		animate = this.checked;
	  }
	  for(var s in shapes)
	  {
		var opt = document.createElement("OPTION");
		opt.text = s;
		opt.value = s;
		if(s == currentShape)
		{
			opt.selected = true;
		}
		$('shape').appendChild(opt);
	  }
	  
	  tick();
	  // this doesn't work: $('fill').addEventListener('change', update, true)
	  // how do you do what I want to do there?
	  cls(context);
	  draw_torus(context);
	}
	window.addEventListener('load', init, true);
})(window);