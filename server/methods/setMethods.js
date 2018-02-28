Meteor.methods({
		
 	setClienteAval: function (cliente_id) {
				
		try 
		{
			var cliente =	Meteor.users.findOne(cliente_id);
			
			delete cliente.password;
			
			var aval = {};
			aval.profile = {};
			
			aval.profile = cliente.profile;
 			Avales.insert(aval);
 			
 			Meteor.users.update({_id: cliente_id}, {$set: {"profile.esAval": true}});
 			
  		return true;			     
		}
		catch(err) {
		     
		  return false;
		}
	},
		
		
});	