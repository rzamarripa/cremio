


Meteor.publishComposite("homeGerente", function(options){
	return {
		find() {
			return pagos.find(options);
		},
		
	}
});