Meteor.publish("traspasos",function(params){
  	return Traspasos.find(params);
});