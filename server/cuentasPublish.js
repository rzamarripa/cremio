Meteor.publish("cuentas",function(params){
	if(!this.userId)
		return

	console.log("---inicia cuenta----")
	var user = Meteor.users.findOne(this.userId);
	var where = {$and:[{sucursal_id:user.profile.sucursal_id},params]}
	console.log(where)
	console.log("---fin cuenta----")
	
  	return Cuentas.find(where);
});