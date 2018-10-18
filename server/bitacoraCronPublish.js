Meteor.publish("bitacoraCron",function(params){
  	return BitacoraCron.find(params,{limit :5 , sort :{inicio: -1}});
});