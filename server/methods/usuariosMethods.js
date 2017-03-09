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
				usuarioPersona.direccion	= usuario.profile.direccion;
				usuarioPersona.nombreCompleto	= usuario.profile.nombreCompleto;
				usuarioPersona.telefono	= usuario.profile.telefono;
				usuarioPersona.relaciones = [];
				usuarioPersona.relaciones.push({cliente_id: usuario_id, cliente: usuario.profile.nombreCompleto , tipoPersona: "Cliente", estatus: 0});
		
				Personas.insert(usuarioPersona)
				
				
		}
		else
		{
				var p = Personas.findOne({_id:usuario.profile.persona_id});
				p.relaciones.push({cliente_id: usuario_id, cliente: usuario.profile.nombreCompleto , tipoPersona: "Cliente", estatus: 0});
				Personas.update({_id: usuario.profile.persona_id},{$set:p});
		}
				
				
		var user = Meteor.users.findOne({_id: usuario_id});
		
		user.profile.referenciasPersonales_ids = [];
		
		_.each(usuario.profile.referenciasPersonales, function(referenciaPersonal){
					//Preguntar si es nuevo la Referencia personal
					
					if (!referenciaPersonal.persona_id)
					{
							//Insertar en Personas las referencia y poniedole el usuario_id (regresar el _id de cada persona para ponerlo en una pila
							referenciaPersonal.relaciones = [];
							referenciaPersonal.relaciones.push({cliente_id: usuario_id, cliente: usuario.profile.nombreCompleto , tipoPersona: "Referencia", estatus: 0});
							referenciaPersonal.nombreCompleto = referenciaPersonal.nombre + " " + referenciaPersonal.apellidoPaterno + " " + referenciaPersonal.apellidoMaterno;
							
							var result = Personas.insert(referenciaPersonal);
							user.profile.referenciasPersonales_ids.push(result);					
					}
					else
					{
							var p = Personas.findOne({_id:referenciaPersonal.persona_id});
							p.relaciones.push({cliente_id: usuario_id, cliente: usuario.profile.nombreCompleto , tipoPersona: "Referencia", estatus: 0});
							Personas.update({_id: referenciaPersonal.persona_id},{$set:p});
							user.profile.referenciasPersonales_ids.push(referenciaPersonal.persona_id);
					}
							
		});
		
		
		delete user.profile['referenciasPersonales'];
		
		//actualizar el user para poner solo los ids
		Meteor.users.update({_id: usuario_id},{$set:user})
		
		
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
	getUsuario: function (usuario) {	
	  var user = Meteor.users.findOne({"_id" : usuario});
		return user.profile;
	}
	
});