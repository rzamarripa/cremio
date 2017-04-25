Meteor.publish("cajaMovimientosTurno",function(){
	if(!this.userId)
		return

	var user = Meteor.users.findOne(this.userId);
	var where = {
			$and:[	{caja_id:user.profile.caja_id},
					{$or : [	
								{estatus:1},
								{estatus:2}
							]
						}
				 ]
				}
	
  	return MovimientosCajas.find(where);
});

Meteor.publish("movimientosCaja",function(params){
  	return MovimientosCajas.find(params);
});