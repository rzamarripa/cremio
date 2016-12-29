Meteor.publish("parentesco",function(params){
  	return Parentesco.find(params);
});