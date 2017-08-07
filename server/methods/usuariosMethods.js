

Meteor.methods({
  createUsuario: function (usuario, rol, grupo) {
	  
	  var sucursal;
	  if (rol == "Cliente")
		{
				sucursal = Sucursales.findOne(usuario.profile.sucursal_id);
				var numero;
				if (sucursal.folioCliente != undefined)				
				 	  numero = sucursal.folioCliente + 1;
				else	
				{
						sucursal.folioCliente = 0;
						numero = sucursal.folioCliente + 1;
				}
				
				if (numero < 10)
					 usuario.username = sucursal.clave + '-C000' + numero;
				else if (numero < 100)
	  			 usuario.username = sucursal.clave + '-C00' + numero;
	  		else if (numero < 1000)
	  			 usuario.username = sucursal.clave + '-C0' + numero;	 
	  		else
	  			 usuario.username = sucursal.clave + '-C' + numero;
	  			 	  			 	 
	  		//usuario.contrasena = Math.random().toString(36).substring(2,7);
	  		usuario.password = '123';
	  		sucursal.folioCliente = numero;
	  		usuario.profile.numeroCliente = usuario.username;
	  		
	  } 
	  else if (rol == "Distribuidor")
	  {
		  	sucursal = Sucursales.findOne(usuario.profile.sucursal_id);
				var numero;
				if (sucursal.folioDistribuidor != undefined)				
				 	  numero = sucursal.folioDistribuidor + 1;
				else	
				{
						sucursal.folioDistribuidor = 0;
						numero = sucursal.folioDistribuidor + 1;
				}
				
				if (numero < 10)
					 usuario.username = sucursal.clave + '-D000' + numero;
				else if (numero < 100)
	  			 usuario.username = sucursal.clave + '-D00' + numero;
	  		else if (numero < 1000)
	  			 usuario.username = sucursal.clave + '-D0' + numero;	 
	  		else
	  			 usuario.username = sucursal.clave + '-D' + numero;
	  			 	  			 	 
	  		//usuario.contrasena = Math.random().toString(36).substring(2,7);
	  		usuario.password = '123';
	  		sucursal.folioCliente = numero;
	  		usuario.profile.numeroCliente = usuario.username;
		  
	  }
		
		//Crea al Usuario
		var usuario_id = Accounts.createUser({
			username: usuario.username,
			password: usuario.password,			
			profile: usuario.profile
		});
		
		Roles.addUsersToRoles(usuario_id, rol, grupo);
		

		if (rol == "Cliente")
		{
				Sucursales.update({_id: sucursal._id},{$set:{folioCliente : sucursal.folioCliente}});
				
/*
				Meteor.call('sendEmail',
					usuario.profile.correo,
					'sistema@corazonvioleta.mx',
					'Bienvenido a Crédito Mio',
					'Usuario: '+ usuario.username + ' contraseña: ' + usuario.password
				);
*/
		}

		//Insertar en personas el Cliente (Regresar el id)
/*
		var usuarioPersona = {};
		
		if (!usuario.profile.persona_id)
		{
				usuarioPersona.nombre	= usuario.profile.nombre;
				usuarioPersona.apellidoPaterno	= usuario.profile.apellidoPaterno;
				usuarioPersona.apellidoMaterno	= usuario.profile.apellidoMaterno;
				usuarioPersona.nombreCompleto	= usuario.profile.nombreCompleto;
				usuarioPersona.rol = rol;
				usuarioPersona.relaciones = [];
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
*/

		var user = Meteor.users.findOne({_id: usuario_id});
		user.profile.referenciasPersonales_ids = [];
		
		_.each(usuario.profile.referenciasPersonales, function(referenciaPersonal){
				if (referenciaPersonal.estatus == "N") referenciaPersonal.estatus = "G";
				    user.profile.referenciasPersonales_ids.push({num										: referenciaPersonal.num, 
					    																					 numeroCliente					: user.profile.numeroCliente,
					    																					 referenciaPersonal_id	: referenciaPersonal._id, 
					    																					 nombreCompleto					: referenciaPersonal.nombreCompleto,
					    																					 parentesco							: referenciaPersonal.parentesco, 
					    																					 tiempoConocerlo				: referenciaPersonal.tiempoConocerlo, 
					    																					 estatus								: referenciaPersonal.estatus});
				
				//Agregar un arrar de la info del cliente en el AVAl
				var RP = ReferenciasPersonales.findOne(referenciaPersonal._id);
				RP.clientes.push({cliente_id			: usuario_id,
													nombreCompleto	: user.profile.nombreCompleto,
												  parentesco			: referenciaPersonal.parentesco, 
												  tiempoConocerlo	: referenciaPersonal.tiempoConocerlo, 
												  estatus					: referenciaPersonal.estatus});
				
				var idTemp = RP._id;
				delete RP._id;
				ReferenciasPersonales.update({_id: idTemp}, {$set:RP})	
				
/*
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
*/

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
	/*
updateUsuario: function (usuario, rol) {		
	  var user = Meteor.users.findOne({"username" : usuario.username});
	  Meteor.users.update({_id: user._id}, {$set:{
			username: usuario.username,
			roles: [rol],
			profile: usuario.profile
		}});
		
		Accounts.setPassword(user._id, usuario.password, {logout: false});		
	},
*/
	updateUsuario: function (usuario, referenciasPersonales, rol) {
		
	  var user = Meteor.users.findOne({"username" : usuario.username});

		_.each(referenciasPersonales, function(referenciaPersonal){
				
				if (referenciaPersonal.estatus == "N"){					
						referenciaPersonal.estatus = "G";
						user.profile.referenciasPersonales_ids.push({num										: referenciaPersonal.num, 
					    																					 numeroCliente					: user.profile.numeroCliente,
					    																					 referenciaPersonal_id	: referenciaPersonal._id, 
					    																					 nombreCompleto					: referenciaPersonal.nombreCompleto,
					    																					 parentesco							: referenciaPersonal.parentesco, 
					    																					 tiempoConocerlo				: referenciaPersonal.tiempoConocerlo, 
					    																					 estatus								: referenciaPersonal.estatus});
						
						var RP = ReferenciasPersonales.findOne(aval.aval_id);
						RP.clientes.push({cliente_id			: usuario_id,
															nombreCompleto	: user.profile.nombreCompleto,
														  parentesco			: referenciaPersonal.parentesco, 
														  tiempoConocerlo	: referenciaPersonal.tiempoConocerlo, 
														  estatus					: referenciaPersonal.estatus});	
						
						var idTemp = RP._id;
						delete RP._id;
						ReferenciasPersonales.update({_id: idTemp}, {$set: RP});
						
				} 
				else if (referenciaPersonal.estatus == "A"){
						//Buscar referenciasPersonales_ids y actualizarlo						
						_.each(user.profile.referenciasPersonales_ids, function(referenciaPersonal_ids){
								if (referenciaPersonal_ids.num == referenciaPersonal.num)
								{						
										
										referenciaPersonal_ids.parentesco 			= referenciaPersonal.parentesco;
										referenciaPersonal_ids.tiempoConocerlo 	= referenciaPersonal.tiempoConocerlo;
										referenciaPersonal_ids.estatus 					= "G";
										
										var RP = ReferenciasPersonales.findOne(referenciaPersonal_ids.referenciaPersonal_id);
										_.each(RP.clientes, function(cliente){
												if (cliente.cliente_id == user._id)
												{
														cliente.parentesco 			= referenciaPersonal.parentesco;
														cliente.tiempoConocerlo = referenciaPersonal.tiempoConocerlo;
												}
										});
										var idTemp = RP._id;
										delete RP._id;
										ReferenciasPersonales.update({_id: idTemp}, {$set: RP});
								}
						});				
				}
				
				/*
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
*/
							
		});
	  
	  //console.log(user.profile.referenciasPersonales_ids);  
	  //delete usuario.profile.referenciasPersonales_ids;
	  //usuario.profile.referenciasPersonales_ids = user.user.profile.referenciasPersonales_ids;
	  
	  
	  Meteor.users.update({_id: user._id}, {$set:{
			username: usuario.username,
			roles: [rol],
			password: usuario.password,
			profile: user.profile
		}});
		
		Accounts.setPassword(user._id, usuario.password, {logout: false});		
	},
	getUsuario: function (usuario) {	
	  var user = Meteor.users.findOne({"_id" : usuario}, {fields: {"profile.nombreCompleto":1}});
	  
		return user.profile;
	},
	getAval: function (aval_id) {	
	  var a = Avales.findOne({"_id" : aval_id});
	  
	  var ocupacion = Ocupaciones.findOne(a.profile.ocupacion_id);
	  a.profile.ocupacion = "";
	  a.profile.ocupacion = ocupacion.nombre;
	  
	  
	  var estadoCivil = EstadoCivil.findOne(a.profile.estadoCivil_id);
	  a.profile.estadoCivil = "";
	  a.profile.estadoCivil = estadoCivil.nombre;
	  
	  var empresa = Empresas.findOne(a.profile.empresa_id);
	  a.profile.empresa = {};
	  a.profile.empresa = empresa;
	  
		return a.profile;
	},
	getReferenciaPersonal: function (id) {	
	  var RP = ReferenciasPersonales.findOne({_id : id});
		return RP;
	},
	getPersonas: function (nombre) {	//Se hizo para la validacion de Clientes, Avales y Referencias Personales
	  var personas = {};
	  personas.clientes = [];
	  personas.avales = [];
	  personas.referenciasPersonales = [];
	  personas.clientes = Meteor.users.find({ "profile.nombreCompleto": { '$regex' : '.*' + nombre || '' + '.*', '$options' : 'i' },roles : ["Cliente"]}, 
	  																			{ fields: {"profile.nombreCompleto": 1, "profile.sexo": 1, "profile.foto": 1, "profile.referenciasPersonales_ids": 1 }}, 
																					{ sort : {"profile.nombreCompleto" : 1 }}, {"profile.nombreCompleto":1, "profile.referenciasPersonales_ids":1}).fetch();
									 
		personas.avales = Avales.find({ "profile.nombreCompleto": { '$regex' : '.*' + nombre || '' + '.*', '$options' : 'i' }}, 
																	{ fields: {"profile.nombreCompleto":1, "profile.sexo": 1, "profile.foto": 1, "profile.creditos": 1 }},
																	{ sort : {"profile.nombreCompleto" : 1 }}).fetch();
									 
		personas.referenciasPersonales = ReferenciasPersonales.find({ nombreCompleto: { '$regex' : '.*' + nombre || '' + '.*', '$options' : 'i' }}, 
																																{ fields: {nombreCompleto:1, clientes: 1 }}, 
																																{ sort : {nombreCompleto : 1 }}).fetch();
	  return personas;
	}
	
});