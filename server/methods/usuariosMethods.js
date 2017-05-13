Meteor.methods({
  createUsuario: function (usuario, rol, grupo) {
	  
		var usuario_id = Accounts.createUser({
			username: usuario.username,
			password: usuario.password,			
			profile: usuario.profile
		});
		
		Roles.addUsersToRoles(usuario_id, rol, grupo);

		//Insertar en personas el Cliente (Regresar el id)
		var usuarioPersona = {};
		
		if (!usuario.profile.persona_id)
		{
				
				usuarioPersona.nombre	= usuario.profile.nombre;
				usuarioPersona.apellidoPaterno	= usuario.profile.apellidoPaterno;
				usuarioPersona.apellidoMaterno	= usuario.profile.apellidoMaterno;
				usuarioPersona.nombreCompleto	= usuario.profile.nombreCompleto;
				usuarioPersona.relaciones = [];
/*
				usuarioPersona.relaciones.push({cliente_id			: usuario_id, 
																				cliente					: usuario.profile.nombreCompleto,
																				nombre					: usuario.profile.nombre,
																				apellidoPaterno	: usuario.profile.apellidoPaterno,
																				apellidoMaterno	: usuario.profile.apellidoMaterno,
																				direccion				: usuario.profile.direccion,
																				telefono				: usuario.profile.telefono,	
																				tipoPersona			: "Cliente", 
																				estatus: 0});
*/
		
				Personas.insert(usuarioPersona)
				
				
		}
		else
		{
				var p = Personas.findOne({_id:usuario.profile.persona_id});
				
				p.relaciones.push({cliente_id			: usuario_id, 
													 cliente				: usuario.profile.nombreCompleto,
													 nombre					: usuario.profile.nombre,
													 apellidoPaterno: usuario.profile.apellidoPaterno,
													 apellidoMaterno: usuario.profile.apellidoMaterno,
													 direccion			: usuario.profile.direccion,
													 telefono				: usuario.profile.telefono,	
													 tipoPersona		: "Cliente", 
													 estatus: 0});
													 
				Personas.update({_id: usuario.profile.persona_id},{$set:p});
		}
				
				
		var user = Meteor.users.findOne({_id: usuario_id});
		
		user.profile.referenciasPersonales_ids = [];
		
		_.each(usuario.profile.referenciasPersonales, function(referenciaPersonal){
					//Preguntar si es nuevo la Referencia personal
					
					if (!referenciaPersonal.persona_id)
					{
							var relacion = {nombre					: referenciaPersonal.nombre,
														  apellidoPaterno : referenciaPersonal.apellidoPaterno,
														  apellidoMaterno : referenciaPersonal.apellidoMaterno,
														  nombreCompleto  : referenciaPersonal.nombre + " " + referenciaPersonal.apellidoPaterno + " " + referenciaPersonal.apellidoMaterno
														  };		
							
							//Insertar en Personas las referencia y poniedole el usuario_id (regresar el _id de cada persona para ponerlo en una pila
							relacion.relaciones = [];
							relacion.relaciones.push({cliente_id			: usuario_id, 
																				cliente					: usuario.profile.nombreCompleto, 
																				nombre					: referenciaPersonal.nombre,
																				apellidoPaterno : referenciaPersonal.apellidoPaterno,
																				apellidoMaterno : referenciaPersonal.apellidoMaterno,
																				parentezco			: referenciaPersonal.parentezco,
																				direccion				:	referenciaPersonal.direccion,
																				telefono				: referenciaPersonal.telefono,
																				tiempo					: referenciaPersonal.tiempo,
																				num							: referenciaPersonal.num,
																				tipoPersona			: "Referencia", 
																				estatus					: 0});
																									
							//referenciaPersonal.nombreCompleto = referenciaPersonal.nombre + " " + referenciaPersonal.apellidoPaterno + " " + referenciaPersonal.apellidoMaterno;
							
							var result = Personas.insert(relacion);
							user.profile.referenciasPersonales_ids.push(result);					
					}
					else
					{
							var p = Personas.findOne({_id:referenciaPersonal.persona_id});
							p.relaciones.push({cliente_id			 : usuario_id, 
																 cliente				 : usuario.profile.nombreCompleto,
																 nombre					 : referenciaPersonal.nombre,
																 apellidoPaterno : referenciaPersonal.apellidoPaterno,
																 apellidoMaterno : referenciaPersonal.apellidoMaterno,
																 parentezco			 : referenciaPersonal.parentezco,
																 direccion			 : referenciaPersonal.direccion,
																 telefono				 : referenciaPersonal.telefono,
																 tiempo					 : referenciaPersonal.tiempo,
																 num						 : referenciaPersonal.num,
																 tipoPersona		 : "Referencia", 
																 estatus				 : 0});
																 
							Personas.update({_id: referenciaPersonal.persona_id},{$set:p});
							user.profile.referenciasPersonales_ids.push(referenciaPersonal.persona_id);
					}
							
		});
		
		
		delete user.profile['referenciasPersonales'];
		
		//actualizar el user para poner solo los ids
		Meteor.users.update({_id: usuario_id},{$set:user})
		
		return user._id;
	},
	userIsInRole: function(usuario, rol, grupo, vista){
		if (!Roles.userIsInRole(usuario, rol, grupo)) {
	    throw new Meteor.Error(403, "Usted no tiene permiso para entrar a " + vista);
	  }
	},
	createGerenteSucursal: function (usuario, rol) {

		var usuario_id = Accounts.createUser({
			username: usuario.username,
			password: usuario.password,			
			profile: usuario.profile
		});
		
		Roles.addUsersToRoles(usuario_id, rol);
		
	},
	updateGerenteSucursal: function (usuario, rol) {		
	  var user = Meteor.users.findOne({"username" : usuario.username});
	  Meteor.users.update({_id: user._id}, {$set:{
			username: usuario.username,
			roles: [rol],
			profile: usuario.profile
		}});
		
		Accounts.setPassword(user._id, usuario.password, {logout: false});		
	},
	updateGerenteVenta: function (usuario, referenciasPersonales, rol) {
	//console.log(usuario,rol)		
	  var user = Meteor.users.findOne({"username" : usuario.username});

		
		_.each(referenciasPersonales, function(referenciaPersonal){

					if (referenciaPersonal.buscarPersona_id)
					{
							//console.log(referenciaPersonal.buscarPersona_id);
							var p = Personas.findOne({_id:referenciaPersonal.buscarPersona_id});
							
							//console.log("P:",p)	
							
							p.nombre = referenciaPersonal.nombre;
							p.apellidoPaterno = referenciaPersonal.apellidoPaterno;
							p.apellidoMaterno = referenciaPersonal.apellidoMaterno;
														
							_.each(p.relaciones, function(relacion){
									if (relacion.cliente_id == user._id){

											relacion.cliente_id 		 = user._id;
											relacion.cliente 				 = user.profile.nombreCompleto;
											relacion.nombre					 = referenciaPersonal.nombre;
											relacion.apellidoPaterno = referenciaPersonal.apellidoPaterno;
											relacion.apellidoMaterno = referenciaPersonal.apellidoMaterno;
											relacion.parentezco			 = referenciaPersonal.parentezco;
											relacion.direccion			 = referenciaPersonal.direccion;
											relacion.telefono				 = referenciaPersonal.telefono;
											relacion.tiempo					 = referenciaPersonal.tiempo;
											relacion.num						 = referenciaPersonal.num;
											relacion.tipoPersona		 = "Referencia"; 
											relacion.estatus				 = 0;
									}
							});
							
							//console.log("Actualizar cliente_id:",p);
							
							Personas.update({_id: referenciaPersonal.buscarPersona_id},{$set:p});
					}
					else if (referenciaPersonal.persona_id)
					{
							
							var p = Personas.findOne({_id:referenciaPersonal.persona_id});
							

							p.relaciones.push({cliente_id	 		 : user._id, 
																 cliente		 		 : user.profile.nombreCompleto,
																 nombre					 : referenciaPersonal.nombre,
																 apellidoPaterno : referenciaPersonal.apellidoPaterno,
																 apellidoMaterno : referenciaPersonal.apellidoMaterno,
																 parentezco	 		 : referenciaPersonal.parentezco,
																 direccion	 		 : referenciaPersonal.direccion,
																 telefono	   		 : referenciaPersonal.telefono,
																 tiempo			 		 : referenciaPersonal.tiempo,
																 num				 		 : referenciaPersonal.num,
																 tipoPersona 		 : "Referencia", 
																 estatus				 : 0});
																 
							//console.log("Actualizar persona_id:",p);
							
							Personas.update({_id: referenciaPersonal.persona_id},{$set:p});
							usuario.profile.referenciasPersonales_ids.push(referenciaPersonal.persona_id);
					}
					else //(referenciaPersonal.persona_id != undefined && referenciaPersonal.cliente_id != undefined)
					{

							var relacion = {nombre					: referenciaPersonal.nombre,
														  apellidoPaterno : referenciaPersonal.apellidoPaterno,
														  apellidoMaterno : referenciaPersonal.apellidoMaterno,
														  nombreCompleto  : referenciaPersonal.nombre + " " + referenciaPersonal.apellidoPaterno + " " + referenciaPersonal.apellidoMaterno
														  };		
							
							relacion.relaciones = [];
							relacion.relaciones.push({cliente_id			: user._id, 
																				cliente					: usuario.profile.nombreCompleto, 
																				nombre					: referenciaPersonal.nombre,
																				apellidoPaterno : referenciaPersonal.apellidoPaterno,
																				apellidoMaterno : referenciaPersonal.apellidoMaterno,
																				parentezco			: referenciaPersonal.parentezco,
																				direccion				:	referenciaPersonal.direccion,
																				telefono				: referenciaPersonal.telefono,
																				tiempo					: referenciaPersonal.tiempo,
																				num							: referenciaPersonal.num,
																				tipoPersona			: "Referencia", 
																				estatus					: 0});
							
							//console.log("Actualizar sin nada:",relacion);
																									
							var result = Personas.insert(relacion);
							usuario.profile.referenciasPersonales_ids.push(result);

							}
							
		});
	  	  
	  console.log(usuario);
	  //delete usuario.profile.referenciasPersonales_ids;
	  
	  //usuario.profile.referenciasPersonales_ids = user.user.profile.referenciasPersonales_ids;
	  
	  
	  Meteor.users.update({_id: user._id}, {$set:{
			username: usuario.username,
			roles: [rol],
			password: usuario.password,
			profile: usuario.profile
		}});
		
		Accounts.setPassword(user._id, usuario.password, {logout: false});		
	},
	getUsuario: function (usuario) {	
	  var user = Meteor.users.findOne({"_id" : usuario});
		return user.profile;
	}
	
});