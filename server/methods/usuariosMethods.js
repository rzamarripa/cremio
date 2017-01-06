Meteor.methods({
  createUsuario: function (usuario, rol, grupo) {
		var usuario_id = Accounts.createUser({
			username: usuario.username,
			password: usuario.password,			
			profile: usuario.profile
		});
		
		Roles.addUsersToRoles(usuario_id, rol, grupo);
		
	},
	userIsInRole: function(usuario, rol, grupo, vista){
		if (!Roles.userIsInRole(usuario, rol, grupo)) {
	    throw new Meteor.Error(403, "Usted no tiene permiso para entrar a " + vista);
	  }
	}
});