// JavaScript Document

$(function (){
		   var currentClassName='initial';
						 
				
						  $("#hubGrid div").click(function(event){
						  	event.preventDefault();
						  	if(currentClassName != this.id+'Active'){
								$("#hubGrid div").switchClass(currentClassName,this.id+"Active",500);
								currentClassName=this.id+'Active';
						  	} else {
								$("#hubGrid div").switchClass(currentClassName,"initial",500);
								currentClassName="initial";
						  	}
						  });
						   
});