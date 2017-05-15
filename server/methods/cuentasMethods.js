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
	},
	traspasoCuentaCaja : function ( origen_id,destino_id,cantidad,cuenta){
		
		var origen = Cuentas.findOne(origen_id);
		var destino = Cajas.findOne(destino_id);

		var user=Meteor.user();

		if(user.roles[0] != "Gerente")
			throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');
		if(!destino || !origen || origen.saldo<cantidad || cantidad<=0)
			throw new Meteor.Error(403, 'Error 500: Error', 'Datos no validos');
		origen.saldo -= cantidad;
		destino.cuenta[cuenta].saldo += cantidad;

		var objeto ={
			origen_id : origen._id,
			destino_id : destino._id,
			tipoCuenta_id : cuenta,
			importe : cantidad,
			tipo : "CuentaCaja",
			estatus : 1,
			createdBy : user._id,
			createdAt : new Date(),
			sucursal_id : user.profile.sucursal_id,
			updated : false
		}
		
		var traspaso_id=Traspasos.insert(objeto);

		var movimientoOrigen = {
			tipoMovimiento : "Retiro Por Traspaso",
			origen : "Traspaso Cuenta Caja",
			origen_id : traspaso_id,
			caja_id : destino._id,
			cuenta_id :origen_id,
			monto : cantidad * -1,
			sucursal_id : user.profile.sucursal_id,
			createdAt : new Date(),
			createdBy : user._id,
			updated : false,
			estatus : 1
		}
		var movimientoDestino = {
			tipoMovimiento : "Ingreso Por Traspaso",
			origen : "Traspaso Cuenta Caja",
			origen_id : traspaso_id,
			caja_id : destino._id,
			cuenta_id :cuenta,
			monto : cantidad,
			sucursal_id : user.profile.sucursal_id,
			createdAt : new Date(),
			createdBy : user._id,
			updated : false,
			estatus : 1
		}
		MovimientosCuenta.insert(movimientoOrigen);
		MovimientosCajas.insert(movimientoDestino);

		var origenid = origen._id;
		var destinoid = destino._id;

		origen.updated = true;
		origen.updatedBy = user._id;
		origen.updatedAt = new Date();

		destino.updated = true;
		destino.updatedBy = user._id;
		destino.updatedAt = new Date();

		Cuentas.update({_id:origenid},{$set:origen});
		Cajas.update({_id:destinoid},{$set:destino});

		return "200";
	},
	traspasoCuentaCuenta : function ( origen_id,destino_id,cantidad){
		
		var origen = Cuentas.findOne(origen_id);
		var destino = Cuentas.findOne(destino_id);

		var user=Meteor.user();
		console.log(origen)
		console.log(destino)
		console.log(cantidad)
		if(user.roles[0] != "Gerente")
			throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');
		if(!destino || !origen || origen.saldo<cantidad || cantidad<=0)
			throw new Meteor.Error(403, 'Error 500: Error', 'Datos no validos');
		origen.saldo -= cantidad;
		destino.saldo += cantidad;

		var objeto ={
			origen_id : origen._id,
			destino_id : destino._id,
			tipoCuenta_id : destino.tipoIngreso_id,
			importe : cantidad,
			tipo : "CuentaCuenta",
			estatus : 1,
			createdBy : user._id,
			createdAt : new Date(),
			sucursal_id : user.profile.sucursal_id,
			updated : false
		}
		
		var traspaso_id=Traspasos.insert(objeto);

		var movimientoOrigen = {
			tipoMovimiento : "Retiro Por Traspaso",
			origen : "Traspaso Cuenta Cuenta",
			origen_id : traspaso_id,
			//caja_id : origen._id,
			cuenta_id :origen_id,
			monto : cantidad * -1,
			sucursal_id : user.profile.sucursal_id,
			createdAt : new Date(),
			createdBy : user._id,
			updated : false,
			estatus : 1
		}
		var movimientoDestino = {
			tipoMovimiento : "Ingreso Por Traspaso",
			origen : "Traspaso Cuenta Cuenta",
			origen_id : traspaso_id,
			//caja_id : destino._id,
			cuenta_id :destino_id,
			monto : cantidad,
			sucursal_id : user.profile.sucursal_id,
			createdAt : new Date(),
			createdBy : user._id,
			updated : false,
			estatus : 1
		}
		MovimientosCuenta.insert(movimientoOrigen);
		MovimientosCuenta.insert(movimientoDestino);

		var origenid = origen._id;
		var destinoid = destino._id;

		origen.updated = true;
		origen.updatedBy = user._id;
		origen.updatedAt = new Date();

		destino.updated = true;
		destino.updatedBy = user._id;
		destino.updatedAt = new Date();

		Cuentas.update({_id:origenid},{$set:origen});
		Cuentas.update({_id:destinoid},{$set:destino});

		return "200";
	}

});