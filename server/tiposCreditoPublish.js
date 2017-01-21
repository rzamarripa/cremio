Meteor.publish("tiposCredito",function(params){
  	return TiposCredito.find(params);
});