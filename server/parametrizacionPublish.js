Meteor.publish("parametrizacion",function(params){
  	return Parametrizacion.find(params,  {sort:{fechaLiquidacion:-1}},{ limit: 1});
  	
});