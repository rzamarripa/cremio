Meteor.publish("tiposNotasCredito",function(params){
  	return TiposNotasCredito.find(params);
});