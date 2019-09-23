
Meteor.publish("buscarPromotoras",function(options){
	if (options != undefined)
		if(options.where.nombreCompleto.length > 0){
			let selector = {
		  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
		  	roles : ["Promotora"]
			}
			return Meteor.users.find(selector, options.options);	
		}
});

Meteor.publish("promotoras",function(params){
  return Meteor.users.find(params);
});

Meteor.publish("allPromotoras",function(){
	return Meteor.users.find({roles : ["Promotora"]});
})

Meteor.publish("promotoraId",function(options){
  return Meteor.users.find({_id:options.id,roles : ["Promotora"]});
});