Meteor.methods({
	crearNotaDeCredito : function(user_id,nota) {
		var user=Meteor.user();
		if(user.roles[0] != "Gerente" && user.roles[0] != "Supervisor")
			throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');
		
		var nuser = Meteor.users.findOne(user_id);
		if(!nuser || nota.monto < 1)
			throw new Meteor.Error(403, 'Error 500: Error', 'Datos no validos');
		
		var fechaInicial = new Date();
		var fechaFinal = '';
		
		if (nota.fecha != undefined)
		{
		 		fechaFinal = nota.fecha; 
		 		fechaFinal = new Date(fechaFinal.getFullYear(),fechaFinal.getMonth(),fechaFinal.getDate(),0,0,0,0);
		} 		
		
		var objeto ={
			importe 			: Number(parseFloat(nota.monto).toFixed(2)),
			saldo 				: Number(parseFloat(nota.monto).toFixed(2)),
			causa					: nota.causa,
			aplica				:	nota.aplicaA,
			estatus 		  : 1,
			cliente_id 	  : user_id,
			createdBy 	  : user._id,
			createdAt 	  : fechaInicial,
			vigencia 		  : fechaFinal,
			sucursal_id   : user.profile.sucursal_id,
			updated 		  : false
		};

		var nota_id = NotasCredito.insert(objeto);

		if(!nuser.profile.notasCredito){
			nuser.profile.notasCredito={
				saldo : 0,
				referencias : []
			};
		}

/*
		nuser.profile.notasCredito.saldo += Number(parseFloat(nota.monto).toFixed(2));
		nuser.profile.notasCredito.referencias.push(nota_id);
		Meteor.users.update({_id:user_id},{$set:{'profile':nuser.profile}})
*/

		return "200";
	},
	actualizarNotaDeCredito : function(user_id, monto){
		//console.log(user_id,monto)
		var user = Meteor.user();
		var exito = false;
		
		if(user.roles[0] != "Cajero")
			throw new Meteor.Error(403, 'Error 403: Permiso denegado', 'Permiso denegado');
		
		var nuser = Meteor.users.findOne(user_id);
		
		if(!nuser || monto < 1 )
			throw new Meteor.Error(403, 'Error 500: Error', 'Datos no validos');

/*
		nuser.profile.notasCredito.saldo -= Number(parseFloat(monto).toFixed(2));
		nuser.profile.notasCredito.saldo = Number(parseFloat(nuser.profile.notasCredito.saldo).toFixed(2));
*/
		
		Meteor.users.update({_id:user_id},{$set:{'profile':nuser.profile}})

		var notas =  NotasCredito.find({cliente_id : user_id, saldo : {$gt: 0},estatus : 1}, {limit: 1},{sort:{createdAt:-1}}).fetch();

		
		_.each(notas,function(nota){
			if(monto > 0){
				if(nota.saldo < monto){
					monto -= Number(parseFloat(nota.saldo).toFixed(2));
					monto = Number(parseFloat(monto).toFixed(2));
					nota.saldo = 0;

					nota.estatus = 3;
					NotasCredito.update({_id:nota._id},{$set:{saldo:0, estatus : nota.estatus}});
				}
				else{					
					
					nota.saldo -= Number(parseFloat(monto).toFixed(2));
					nota.saldo = Number(parseFloat(nota.saldo).toFixed(2));
					monto = 0;
					
					if (nota.saldo == 0)
						 nota.estatus = 3;
						 
					NotasCredito.update({_id:nota._id},{$set: { saldo:nota.saldo, estatus : nota.estatus}});
				}
			}
		});
		return "200"
	},
	deprecarNotasDeCredito : function(){
		var fecha = new Date();
		fecha = new Date(fecha.getFullYear(),fecha.getMonth(),fecha.getDate(),0,0,0,0);
		var notas =  NotasCredito.find({estatus:1, vigencia:{$lt:fecha}, saldo : {$gt: 0}}).fetch();
		
		//console.log(notas);
		_.each(notas,function(nota){
			//var usuario = Meteor.users.findOne(nota.cliente_id);
			//usuario.profile.notasCredito.saldo -= Number(parseFloat(nota.saldo).toFixed(2));
			//nota.saldo = 0;
			nota.estatus = 2;
			//Meteor.users.update({_id:usuario._id},{$set:{'profile':usuario.profile}});
			NotasCredito.update({_id:nota._id},{$set:{estatus:2}});
		});

	}

});