Meteor.publish("buscarCajeros",function(options){
	if (options != undefined)
		if(options.where.nombreCompleto.length > 0){
			let selector = {
		  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
		  	roles : ["Cajero"]
			}
			return Meteor.users.find(selector, options.options);	
		}
});

Meteor.publish("cajero",function(params){
  return Meteor.users.find(params);
});

Meteor.publish("allCajeros",function(params){
	return Meteor.users.find(params);
})

Meteor.publish("cajeroId",function(options){
  return Meteor.users.find({_id:options.id,roles : ["Cajero"]});
});