
Meteor.methods({
		
	getProspectoDitribuidor: function (id) {	
	  	var user = ProspectosDistribuidor.findOne({"_id" : id} );
	  	//console.log(user)
			return user;
	},
	
	validaProspectoDitribuidor: function (nombreCompleto) {	
	  	
	  	var objetos = ProspectosDistribuidor.find({"profile.nombreCompleto": nombreCompleto}).fetch();
			var ban = false;			
			if (objetos.length > 0)
					ban = true
			return ban;
	},
	
		
});