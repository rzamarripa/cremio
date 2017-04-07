Meteor.publish("buscarCajeros",function(options){
	if(options.where.nombreCompleto.length > 0){
		let selector = {
	  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
	  	roles : ["Cajero"]
		}
		return Meteor.users.find(selector, options.options);	
	}
});

Meteor.publish("cajero",function(options){
  return Meteor.users.find(options.id);
});

Meteor.publish("allCajeros",function(){
	return Meteor.users.find({roles : ["Cajero"]});
})

Meteor.publish("cajeroId",function(options){
  return Meteor.users.find({_id:options.id,roles : ["Cajero"]});
});