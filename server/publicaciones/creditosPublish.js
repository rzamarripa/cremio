Meteor.publish("creditos",function(options){
  return Creditos.find(options);
});