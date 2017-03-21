Meteor.methods({
 	crearCuenta : function(cuenta ) {
		var user=Meteor.user();
		if(user.roles[0] != "Gerente")
			return ;
		cuenta.sucursal_id = user.profile.sucursal_id;
		cuenta.owner = user._id;
		cuenta.createdAt = new Date();
		cuenta.updated = false;
		cuenta.estatus = 1;

		var cuentaid = Cuentas.insert(cuenta)

		var movimento = {
			tipoMovimiento : "Saldo inicial",
			origen : "Alta de Cuenta",
			origen_id : cuentaid,
			monto : cuenta.saldo,
			cuenta_id : cuentaid,
			sucursal_id : user.profile.sucursal_id,
			createdAt : new Date(),
			createdBy : user._id,
			updated : false,
			estatus : 1,
		}

		MovimientosCuenta.insert(movimento);

		return cuentaid;
	},
	actualizarCuenta : function(cuenta){
		var user=Meteor.user();
		if(user.roles[0] != "Gerente")
			return ;

		cuenta.sucursal_id = user.profile.sucursal_id;
		cuenta.updatedBy = user._id;
		cuenta.updatedAt = new Date();
		cuenta.updated = true;
		cuenta.estatus = 1;
		
		var oldCuenta = Cuentas.findOne(cuenta._id);
		var cuentaid = cuenta._id;
		delete cuenta._id
		Cuentas.update({_id:cuentaid},{$set:cuenta})
		if(oldCuenta.saldo != cuenta.saldo){
			var movimiento = {
				tipoMovimiento : "Actualizacion de Saldo",
				origen : "Actualizacion de Cuenta",
				origen_id : cuentaid,
				monto : cuenta.saldo - oldCuenta.saldo,
				cuenta_id : cuentaid,
				sucursal_id : user.profile.sucursal_id,
				createdAt : new Date(),
				createdBy : user._id,
				updated : false,
				estatus : 1
			}
			MovimientosCuenta.insert(movimiento);
		}
		return "Ok";
	}
});