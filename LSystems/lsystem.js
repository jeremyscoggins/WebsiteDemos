(function(window){
	var iterations,angle,constants,axiom,rules, canvas, context, animate,framerate=60,frametime=1000/framerate;
	var colors = ["black","brown","darkgreen","green","lightgreen","blue","red","purple","white"];
	
	function $(id)
	{
		return document.getElementById(id);
	}
	function readRules()
	{
		iterations = $("iterations").value;
		angle = $("angle").value;
		constants = $("constants").value;
		axiom = $("axiom").value;
		rules = [];
		rules.push($("rule1").value);
		if($("rule2").value)
			rules.push($("rule2").value);
		if($("rule3").value)
			rules.push($("rule3").value);
		if($("rule4").value)
			rules.push($("rule4").value);
		if($("rule5").value)
			rules.push($("rule5").value);
	}
	function reduce(list,func)
	{
		var result=null;
		for(var i = 0; i < list.length; i++)
		{
			result = func.call(list[i],result,list[i]);
		}
		return result;
	}
	function map(list,func)
	{
		var result=[];
		for(var i = 0; i < list.length; i++)
		{
			var item = func.call(list[i],list[i]);
			if(item)
			{
				result.push(item);
			}
		}
		return result;
	}
	function scale(positions, height, width)
	{
		var minX = reduce(positions,function(a,b){ return a <= b[0] ? a : b[0] });
		var maxX = reduce(positions,function(a,b){ return a <= b[0] ? b[0] : a });
		var minY = reduce(positions,function(a,b){ return a <= b[1] ? a : b[1] });
		var maxY= reduce(positions,function(a,b){ return a <= b[1] ? b[1] : a });
		var oWidth = maxX - minX;
		var oHeight = maxY - minY;
		var oCenterX= (oWidth / 2) + minX;
		var oCenterY= (oHeight / 2) + minY;
		var scale = Math.min(width / oWidth, height / oHeight) * .99;
		return map(positions,function(p){ return [(p[0] - oCenterX) * scale ,(p[1] - oCenterY) * scale, p[2] ]  });
	}
	function translate(positions, x, y)
	{
		return map(positions,function(p){ return [p[0] += x ,p[1] += y, p[2] ]  });
	}
	function deg2rad(deg)
	{
		return deg * (Math.PI/180);
	}
	function rad2deg(rad)
	{
		return rad * (180/Math.PI);
	}
	function processSteps(steps, startX, startY, startAngle)
	{
		var angleRad = deg2rad(parseInt(angle));
		var currentColor = colors[0];
		var currentAngle = deg2rad(startAngle || -90);
		var positionX = startX || 0;
		var positionY = startY || 0;
		var newPositionX = null
		var newPositionY = null
		var stack = [];
		var dist = 1;
		var positions = [];
		//var positions = [[positionX,positionY,currentColor]];		
		//context.strokeStyle = 'black';
		//context.beginPath();
		//context.moveTo(positionX,positionY);
		for(var s = 0; s < steps.length; s++)
		{
			switch(steps[s])
			{
				case "+":
					currentAngle += angleRad;
					//console.log("right",currentAngle);
					break;
				case "-":
					currentAngle -= angleRad;
					//console.log("left",currentAngle);
					break;
				case "[":
					stack.push([currentAngle,positionX,positionY]);
					break;
				case "]":
					var last = stack.pop();
					currentAngle = last[0];
					positionX = last[1];
					positionY = last[2];
					break;
				case "C":
					currentColor = colors[parseInt(steps[s+1])+1];
					s++;
					break;
				default:
					//console.log("draw",positionX,positionY, currentAngle);
					newPositionX = positionX+ dist*Math.cos(currentAngle);
					newPositionY = positionY+ dist*Math.sin(currentAngle);
					positions.push([positionX,positionY,currentColor]);
					positions.push([newPositionX,newPositionY,currentColor]);
					positionX = newPositionX;
					positionY = newPositionY;
					//context.lineTo(positionX,positionY);
					break;
			}
		}
		return [positions, positionX, positionY, rad2deg(currentAngle)];
	}
	function drawLine(color,x,y,x2,y2,closePath)
	{
		context.strokeStyle = color;
		if(closePath)
			context.beginPath();
		context.moveTo(x,y);
		context.lineTo(x2,y2);
		if(closePath)
		{
			context.closePath();
			context.stroke();
		}
	}
	function getLineIterator(positions)
	{
		var currentIndex = 0;
		var lastColor=positions[currentIndex][2];
		return function(){
			if(!positions[currentIndex])
				return false;
			if(!animate)
			{
				context.beginPath();
				context.strokeStyle = positions[currentIndex][2];
			}
			if(lastColor != positions[currentIndex][2] && !animate)
			{
				context.closePath();
				context.stroke();
				context.beginPath();
				context.strokeStyle = positions[currentIndex][2];
				lastColor = positions[currentIndex][2];
			}
			drawLine(positions[currentIndex][2],positions[currentIndex][0],positions[currentIndex][1],positions[currentIndex+1][0],positions[currentIndex+1][1],animate);
			if(!animate)
			{
				context.closePath();
				context.stroke();
			}
			currentIndex+=2;
			return true;
		};
	}
	function draw()
	{
		readRules();
		//console.log(axiom);
		var steps = axiom.split("");
		for(var i = 0; i < iterations; i++)
		{
			var newSteps = steps.slice(0);
			for(var r = 0; r < rules.length; r++)
			{
				var match = rules[r].split("=")[0];
				var swap = rules[r].split("=")[1];
				for(var s = 0; s < steps.length; s++)
				{
					if(steps[s] == match)
					{
						newSteps[s] = swap;
					}
				}
			}
			//console.log(newSteps.join(""));
			steps = newSteps.join("").split("");
		}
		var initial = processSteps(axiom.split(""));
		var result = processSteps(steps,initial[1],initial[2],initial[3]);
		var positions = result[0];
		var lastColor = positions[0][2];
		//context.strokeStyle = lastColor;
		//context.beginPath();
		positions = scale(positions,canvas.height,canvas.width);
		positions = translate(positions,canvas.width/2,canvas.height/2);
		/*for(var p =0; p<positions.length; p+=2)
		{
			if(lastColor != positions[p][2])
			{
				context.closePath();
				context.stroke();
				context.beginPath();
				context.strokeStyle = positions[p][2];
				lastColor = positions[p][2];
			}
			context.moveTo(positions[p][0],positions[p][1]);
			context.lineTo(positions[p+1][0],positions[p+1][1]);
			drawLine(positions[p][2],positions[p][0],positions[p][1],positions[p+1][0],positions[p+1][1],true);
		}*/
		var it = getLineIterator(positions);
		if(animate)
		{
			(function doThis(){
				var start = new Date().getTime();
				if(it() && animate)
				{
					setTimeout(doThis, Math.max(frametime-((new Date().getTime())-start),0));
				}
			})();
		}
		else
		{
			while(it()){}
		}
		//context.closePath();
		//context.stroke();
	}
	function clear()
	{
		context.clearRect(0,0,canvas.width,canvas.height);
	}
	function setActiveRuleSet(ruleSet)
	{
		var inputs = document.getElementsByTagName("input");
		for(var i =0; i < inputs.length; i++)
		{
			inputs[i].value = "";
		}
		
		for(var key in ruleSet)
		{
			var item = ruleSet[key];
			if(!(item instanceof Array))
			{
				var obj = $(key);
				if(obj)
				{
					obj.value = item;
				}
			}
			else
			{
				for(var i = 0; i < item.length; i++)
				{
					var obj = $(key.substring(0,key.length-1) + (i+1));
					if(obj)
					{
						obj.value = item[i];
					}
				}
			}					
		}
	}
	
	function init()
	{
		canvas = $("canvas");
		context = canvas.getContext("2d");
		$("go").onclick = function(e){
			e.preventDefault();
			clear();
			draw();
		};
		$("ruleSets").onchange = function(e){
			$("animate").checked=false;
			animate=false;
			var selectedRuleIndex = this.options[this.selectedIndex].value;
			setTimeout(function(){
				setActiveRuleSet(ruleSets[selectedRuleIndex]);
				clear();
				draw();
			},100)
		};
		$("animate").onchange = function(e){
			animate = this.checked;
		};
		for(var r = 0; r < ruleSets.length; r++)
		{
			var opt = document.createElement("option");
			opt.text = ruleSets[r].name;
			opt.value = r;
			opt.selected = r ==0;
			$("ruleSets").appendChild(opt);
		}
		setActiveRuleSet(ruleSets[0]);
		draw();
	}
	window.addEventListener("load",init);
})(window);