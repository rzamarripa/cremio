Meteor.methods({
	crearNotaDeCredito : function(user_id,monto,fechaFinal ) {
		var user=Meteor.user();
		if(user.roles[0] != "Gerente")
			throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');
		var nuser = Meteor.users.findOne(user_id);
		if(!nuser || monto<1)
			throw new Meteor.Error(403, 'Error 500: Error', 'Datos no validos');
		
		var fechaInicial = new Date();
		//fechaInicial = new Date(fechaInicial.getFullYear(),fechaInicial.getMonth(),fechaInicial.getDate(),0,0,0,0);
		//var fechaFinal = new Date();
		fechaFinal = new Date(fechaFinal.getFullYear(),fechaFinal.getMonth(),fechaFinal.getDate(),0,0,0,0);
		

		fechaFinal.setDate(fechaFinal.getDate() + 30);
		//console.log (fechaInicial,fechaFinal)
		var objeto ={
			importe : monto,
			saldo : monto,
			estatus : 1,
			cliente_id : user_id,
			createdBy : user._id,
			createdAt : fechaInicial,
			vigencia : fechaFinal,
			sucursal_id : user.profile.sucursal_id,
			updated : false
		};

		var nota_id = NotasCredito.insert(objeto);

		if(!nuser.profile.notasCredito){
			nuser.profile.notasCredito={
				saldo : 0,
				referencias : []
			};
		}

		nuser.profile.notasCredito.saldo += monto;
		nuser.profile.notasCredito.referencias.push(nota_id);

		Meteor.users.update({_id:user_id},{$set:{'profile':nuser.profile}})

		return "200";
	},
	actualizarNotaDeCredito : function(user_id,monto){
		console.log(user_id,monto)
		var user=Meteor.user();
		console.log(user);
		if(user.roles[0] != "Gerente" && user.roles[0] != "Cajero")
			throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');
		console.log("asdasd")
		var nuser = Meteor.users.findOne(user_id);
		console.log(nuser)
		console.log(user_id)
		if(!nuser || monto<1 || monto>nuser.profile.notasCredito.saldo)
			throw new Meteor.Error(403, 'Error 500: Error', 'Datos no validos');
		
		nuser.profile.notasCredito.saldo -= monto;
		console.log("asd")
		Meteor.users.update({_id:user_id},{$set:{'profile':nuser.profile}})

		var notas =  NotasCredito.find({estatus : 1, cliente_id : user_id}).fetch();
		console.log(notas)
		_.each(notas,function(nota){
			if(monto>0){
				if(nota.saldo<monto){
					monto -= nota.saldo;
					nota.saldo = 0;
					NotasCredito.update({_id:nota._id},{$set:{saldo:0}});
				}
				else{
					
					nota.saldo -= monto;
					monto = 0;
					NotasCredito.update({_id:nota._id},{$set:{saldo:nota.saldo}});
				}
			}
		});
		return "200"
	},
	deprecarNotasDeCredito : function(){
		var fecha = new Date();
		fecha = new Date(fecha.getFullYear(),fecha.getMonth(),fecha.getDate(),0,0,0,0);
		var notas =  NotasCredito.find({estatus:1,fecha:{$gt:fecha}}).fetch();

		_.each(notas,function(nota){
			var usuario = Meteor.users.findOne(notas.cliente_id);
			usuario.profile.notasCredito.saldo -= nota.saldo;
			//nota.saldo = 0;
			nota.estatus = 2;
			Meteor.users.update({_id:usuario._id},{$set:{'profile':usuario.profile}});
			NotasCredito.update({_id:nota._id},{$set:{estatus:2}});
		});

	}

});