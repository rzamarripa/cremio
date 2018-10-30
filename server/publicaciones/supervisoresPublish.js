Meteor.publish("buscarSupervisores",function(options){
	if (options != undefined)
		if(options.where.nombreCompleto.length > 0){
			let selector = {
		  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
		  	roles : ["Supervisor"]
			}
			return Meteor.users.find(selector, options.options);	
		}
});

Meteor.publish("supervisor",function(params){
  return Meteor.users.find(params);
});

Meteor.publish("allSupervisores",function(){
	return Meteor.users.find({roles : ["Supervisor"]});
})

Meteor.publish("supervisorId",function(options){
  return Meteor.users.find({_id:options.id,roles : ["Supervisor"]});
});