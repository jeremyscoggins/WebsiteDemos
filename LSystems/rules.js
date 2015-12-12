/*var ruleSets = [
	{
		name: "dragon",
		iterations : 12,
		angle: 90,
		constants: "",
		axiom: "FX",
		rules:[
			"X=X+YF+",
			"Y=-FX-Y"
		]
	},
	{
		name: "triangle",
		iterations : 4,
		angle: 90,
		constants: "",
		axiom: "-F",
		rules:[
			"F=F+F-F-F+F"
		]
	},
	{
		name: "triangle 2",
		iterations : 7,
		angle: 60,
		constants: "",
		axiom: "A",
		rules:[
			"A=B-A-B",
			"B=A+B+A"
		]
	},
	{
		name: "maze",
		iterations : 6,
		angle: 90,
		constants: "XY",
		axiom: "X",
		rules:[
			"X=-YF+XFX+FY-",
			"Y=+XF-YFY-FX+"
		]
	},
	{
		name: "star",
		iterations : 4,
		angle: 60,
		constants: "X",
		axiom: "F++F++F",
		rules:[
			"F=F-F++F-F",
			"X=FF"
		]
	}
];*/
var ruleSets =
[ { "angle" : 90,
    "axiom" : "FX",
    "constants" : "",
    "iterations" : 12,
    "name" : "Heighway Dragon",
    "rules" : [
    	"X=X+YF+",
        "Y=-FX-Y"
      ]
  },
  { "angle" : 90,
    "axiom" : "-F",
    "constants" : "",
    "iterations" : 4,
    "name" : "Koch Curve",
    "rules" : [
    	"F=F+F-F-F+F"
    ]
  },
  { "angle" : 22,
    "axiom" : "F",
    "constants" : "",
    "iterations" : 5,
    "name" : "Kevs Tree",
    "rules" : [
    	"F=C0FF-[C1-F+F+F]+[C2+F-F-F]"
    ]
  },
  { "angle" : 25,
    "axiom" : "FX",
    "constants" : "",
    "iterations" : 5,
    "name" : "Kevs Wispy Tree",
    "rules" : [
    	"F=C0FF-[C1-F+F]+[C2+F-F]",
        "X=C0FF+[C1+F]+[C3-F]"
      ]
  },
  { "angle" : 27,
    "axiom" : "F",
    "constants" : "",
    "iterations" : 5,
    "name" : "Kevs Pond Weed",
    "rules" : [
    	"F=C0FF[C1-F++F][C2+F--F]C3++F--F"
    	]
  },
  { "angle" : 60,
    "axiom" : "A",
    "constants" : "",
    "iterations" : 7,
    "name" : "Sierpinski triangle (curves)",
    "rules" : [
    	"A=B-A-B",
        "B=A+B+A"
      ]
  },
  { "angle" : 120,
    "axiom" : "F-G-G",
    "constants" : "",
    "iterations" : 6,
    "name" : "Sierpinski triangle (triangles)",
    "rules" : [
    	"F=F-G+F+G-F",
        "G=GG"
      ]
  },
  { "angle" : 90,
    "axiom" : "FX",
    "constants" : "F",
    "iterations" : 10,
    "name" : "Dragon Curve",
    "rules" : [
    	"X=X+YF",
        "Y=FX-Y"
      ]
  },
  { "angle" : 25,
    "axiom" : "X",
    "constants" : "X",
    "iterations" : 6,
    "name" : "Fractal Plant",
    "rules" : [
    	"X=C0F-[C2[X]+C3X]+C1F[C3+FX]-X",
        "F=FF"
      ]
  },
  { "angle" : 60,
    "axiom" : "F++F++F",
    "constants" : "X",
    "iterations" : 4,
    "name" : "Koch Snowflake",
    "rules" : [
    	"F=F-F++F-F",
        "X=FF"
      ]
  },
  { "angle" : 72,
    "axiom" : "F-F-F-F-F",
    "constants" : "",
    "iterations" : 4,
    "name" : "Pleasant Error",
    "rules" : [
    	"F=F-F++F+F-F-F" ]
  },
  { "angle" : 90,
    "axiom" : "F",
    "constants" : "",
    "iterations" : 4,
    "name" : "Sierpinski's Carpet",
    "rules" : [
    	"F=F+F-F-F-G+F+F+F-F",
        "G=GGG"
      ]
  },
  { "angle" : 90,
    "axiom" : "X",
    "constants" : "XY",
    "iterations" : 6,
    "name" : "Space Filling Curve",
    "rules" : [
    	"X=-YF+XFX+FY-",
        "Y=+XF-YFY-FX+"
      ]
  },
  { "angle" : 45,
    "axiom" : "L--F--L--F",
    "constants" : "",
    "iterations" : 8,
    "name" : "Sierpinski Median Curve",
    "rules" : [
    	"L=+R-F-R+",
        "R=-L+F+L-"
      ]
  },
  { "angle" : 30,
    "axiom" : "W",
    "constants" : "",
    "iterations" : 6,
    "name" : "Lace",
    "rules" : [
    	"W=+++X--F--ZFX+",
        "X=---W++F++YFW-",
        "Y=+ZFX--F--Z+++",
        "Z=-YFW++F++Y---"
      ]
  },
  { "angle" : 90,
    "axiom" : "XYXYXYX+XYXYXYX+XYXYXYX+XYXYXYX",
    "constants" : "F",
    "iterations" : 3,
    "name" : "Joined Cross Curves",
    "rules" : [
    	"F=",
        "X=FX+FX+FXFY-FY-",
        "Y=+FX+FXFY-FY-FY"
      ]
  },
  { "angle" : 36,
    "axiom" : "[7]++[7]++[7]++[7]++[7]",
    "constants" : "6 7 8 9",
    "iterations" : 5,
    "name" : "Penrose Tiling",
    "rules" : [
    	"6=81++91----71[-81----61]++",
        "7=+81--91[---61--71]+",
        "8=-61++71[+++81++91]-",
        "9=--81++++61[+91++++71]--71",
        "1="
      ]
  },
  {
    "angle" : 45,
    "axiom" : "0",
    "constants" : "",
    "iterations" : 7,
    "name" : "Simple Tree",
    "rules" : [
    	"1=11",
        "0=1[-0]+0"
      ]
  },
  {
    "angle" : 60,
    "axiom" : "X",
    "constants" : "",
    "iterations" : 4,
    "name" : "Peano Gosper",
    "rules" : [
		"X=X+YF++YF-FX--FXFX-YF+",
		"Y=-FX+YFYF++YF+FX--FX-Y"
      ]
  },
  {
    "angle" : 45,
    "axiom" : "-F++F++F++A",
    "constants" : "",
    "iterations" : 5,
    "name" : "Pythagorean Tree",
    "rules" : [
    	"A=[---F++A++F++F]B[---F++F++A++F]",
      ]
  },
  {
    "angle" : 90,
    "axiom" : "F+F+F+F",
    "constants" : "",
    "iterations" : 4,
    "name" : "Box",
    "rules" : [
    	"F=FF+F+F+F+FF",
      ]
  },
  {
    "angle" : 90,
    "axiom" : "F+F+F+F",
    "constants" : "",
    "iterations" : 4,
    "name" : "Box2",
    "rules" : [
    	"F=FF+F++F+F",
      ]
  },
  {
    "angle" : 90,
    "axiom" : "F+XF+F+XF",
    "constants" : "",
    "iterations" : 5,
    "name" : "Diamond",
    "rules" : [
    	"X=XF-F+F-XF+F+XF-F+F-X",
      ]
  },
  {
    "angle" : 90,
    "axiom" : "F+F+F+F",
    "constants" : "",
    "iterations" : 5,
    "name" : "Pinwheel",
    "rules" : [
    	"F=FF+F+F+F+F+F-F",
      ]
  },
  {
    "angle" : 90,
    "axiom" : "F+XF+F+XF",
    "constants" : "",
    "iterations" : 5,
    "name" : "Kolam",
    "rules" : [
    	"X=XF-F-F+XF+F+XF-F-F+X",
      ]
  },
  {
    "angle" : 45,
    "axiom" : "-X--X",
    "constants" : "",
    "iterations" : 5,
    "name" : "Anklets of Krishna",
    "rules" : [
    	"X=XFX--XFX",
      ]
  },
  {
    "angle" : 90,
    "axiom" : "F",
    "constants" : "",
    "iterations" : 8,
    "name" : "Tilework",
    "rules" : [
    	"F=FF-F-",
      ]
  },
  {
    "angle" : 60,
    "axiom" : "F",
    "constants" : "",
    "iterations" : 8,
    "name" : "Basketweave",
    "rules" : [
    	"F=FF-F-",
      ]
  },
  {
    "angle" : 90,
    "axiom" : "F-F-F-F",
    "constants" : "",
    "iterations" : 2,
    "name" : "Islands and Lakes",
    "rules" : [
    	"F=F-f+FF-F-FF-Ff-FF+f-FF+F+FF+Ff+FFF",
    	"f=ffffff",
      ]
  },
];
