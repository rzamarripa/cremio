Meteor.methods({
 	crearCaja : function(caja ) {
		var user=Meteor.user();
		if(user.roles[0] != "Gerente")
			throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');

		var usuario = Meteor.users.findOne(caja.usuario_id)
		if(usuario.profile.caja_id){
			var cajavieja = Cajas.findOne(usuario.profile.caja_id);
			if(cajavieja.estadoCaja=="Abierta")
				throw new Meteor.Error(500, 'Error 500: Conflicto', 'Caja Abierta');
		}
		caja.sucursal_id = user.profile.sucursal_id;
		caja.createdBy = user._id;
		caja.createdAt = new Date();
		caja.updated = false;
		caja.estatus = true;
		caja.estadoCaja = "Cerrada";


		var cajaid = Cajas.insert(caja)
		
		if(usuario.profile.caja_id)
			Cajas.update({_id:cajavieja._id},{$set:{usuario_id:""}})

		Meteor.users.update({_id:caja.usuario_id},{$set:{'profile.caja_id':cajaid}})

		return cajaid;
	},
	actualizarCaja : function(caja ) {
		var user=Meteor.user();
		if(user.roles[0] != "Gerente")
			throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');

		var usuario = Meteor.users.findOne(caja.usuario_id)
		
		if(caja.estadoCaja == "Abierta")
			throw new Meteor.Error(500, 'Error 500: Conflicto', 'Caja Abierta');

		var cajavieja;

		var oldcaja = Cajas.findOne(caja._id);
		var usuarioViejo =oldcaja.usuario_id;

		if(usuario.profile.caja_id){
			cajavieja = Cajas.findOne(usuario.profile.caja_id);
			if(cajavieja.estadoCaja=="Abierta")
				throw new Meteor.Error(500, 'Error 500: Conflicto', 'Caja Abierta');
		}
		caja.sucursal_id = user.profile.sucursal_id;
		//caja.createdBy = user._id;
		//caja.createdAt = new Date();
		caja.updated = true;
		caja.updatedAt = new Date();
		caja.updatedBy = user._id;
		//caja.estatus = true;
		//caja.estadoCaja = "Cerrado";


		var cajaid = caja._id;
		delete caja._id
		Cajas.update({_id:cajaid},{$set:caja})
	
		if(usuario.profile.caja_id)
			Cajas.update({_id:cajavieja._id},{$set:{usuario_id:""}})
		if(usuarioViejo)
			Meteor.users.update({_id:usuarioViejo},{$set:{'profile.caja_id':""}})

		Meteor.users.update({_id:caja.usuario_id},{$set:{'profile.caja_id':cajaid}})

		return "200";
	},
	abrirCaja : function(caja){
		caja.estadoCaja ="Abierta";
		var cajaid =caja._id;
		var user = Meteor.user()
		_.each(caja.cuenta,function(cuenta,cuentaid){
			var movimiento = {
				tipoMovimiento : "Saldo Inicial",
				origen : "Apertura de Caja",
				origen_id : cajaid,
				caja_id : cajaid,
				cuenta_id :cuentaid,
				monto : cuenta.saldo,
				sucursal_id : user.profile.sucursal_id,
				createdAt : new Date(),
				createdBy : user._id,
				updated : false,
				estatus : 1
			}
			MovimientosCajas.insert(movimiento);
		})
		delete caja._id
		caja.updated = true;
		caja.updatedAt = new Date();
		caja.updatedBy = user._id;
		Cajas.update({_id:cajaid},{$set:caja});

		return "200"
	}
});