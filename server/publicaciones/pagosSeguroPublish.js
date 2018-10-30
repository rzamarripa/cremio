Meteor.publish("pagosSeguro",function(params){
  	return PagosSeguro.find(params);
});