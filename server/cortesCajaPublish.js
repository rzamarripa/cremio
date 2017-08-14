Meteor.publish("cortesCaja",function(params){
  	return CortesCaja.find(params);
});