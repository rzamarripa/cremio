angular.module("creditoMio")
.controller("CobranzaCtrl", CobranzaCtrl);
 function CobranzaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
 	  
  this.fechaInicial = new Date();
  this.fechaInicial.setHours(0,0,0,0);
  this.fechaFinal = new Date();
  this.fechaFinal.setHours(23,0,0,0);
  
  var FI, FF;
  rc.cliente = {};
  rc.credito = {};
  rc.cobranza = {};
  rc.cobranza_id = "";
  rc.notaCobranza = {};
  
  this.selected_credito = 0;
  this.ban = false;
  
  this.subscribe("tiposCredito", ()=>{
		return [{ estatus : true }]
	});

  	this.subscribe('notas',()=>{
		return [{estatus:true}]
	});
	
	this.helpers({
		tiposCredito : () => {
			return TiposCredito.find();
		},
		cobranzas : () => {
			return rc.cobranza;
		},
		notas : () => {
			return Notas.find().fetch();
		},
		usuario : () => {
			return Meteor.users.findOne();
		},
	});

  
  /*
	this.getCobranza = function()
	{
			//
			console.log(this.selected_credito);
			Meteor.call('getCobranza', rc.getReactively("fechaInicial"), rc.getReactively("fechaFinal"), function(error, result) {
						
						if (result)
						{
								this.cobranza = result;
							
						}
			});	
	}
	*/

	
	this.calcularSemana = function(w, y) 
	{
			var ini, fin;
		
	    var simple = new Date(y, 0, 1 + (w - 1) * 7);
	    FI = new Date(simple);
	    FF = new Date(moment(simple).add(7,"days"));
	    
	    FF.setHours(23,59,59,0);
	    
	}
	
	this.calcularMes = function(m, y) 
	{
	    var startDate = moment([y, m]);
			var endDate = moment(startDate).endOf('month');
	    FI = startDate.toDate();
	    FF = endDate.toDate();
	    FF.setHours(23,59,59,0);
	}
	
	this.AsignaFecha = function(op)
	{	
			this.selected_credito = 0;
			if (op == 0) //Vencimiento Hoy
			{
					FI = new Date();
				  FI.setHours(0,0,0,0);
				  FF = new Date();
				  FF.setHours(23,59,59,0);
				  //console.log("FI:",FI);
					//console.log("FF:",FF);
				  
			}	
			else if (op == 1) //Día
			{
					this.fechaInicial.setHours(0,0,0,0);
				  this.fechaFinal = new Date(this.fechaInicial.getTime());
				  this.fechaFinal.setHours(23,59,59,0);
				  FI = this.fechaInicial;
				  FF = this.fechaFinal;
				  
				  //console.log("FI:", FI);
					//console.log("FF:", FF);
					
			}	
			else if (op == 2) //Semana
			{					
					
					FI = new Date();
				  FI.setHours(0,0,0,0);
				  FF = new Date(FI.getTime());
				  FF.setHours(23,59,59,0);
					
					var semana = moment().isoWeek();
					var anio = FI.getFullYear();
					this.calcularSemana(semana, anio);
					//console.log("FI:", FI);
					//console.log("FF:", FF);
				
			}
			else if (op == 3) //Mes
			{
				
					FI = new Date();
					FI.setHours(0,0,0,0);
					var anio = FI.getFullYear();
					var mes = FI.getMonth();
					console.log(mes);
					this.calcularMes(mes,anio);
					//console.log("FI:", FI);
					//console.log("FF:", FF);
				
			}
			else if (op == 4) //Siguiente Mes
			{
					FI = new Date();
					var anio = FI.getFullYear();
					var mes = FI.getMonth();
					if (mes == 11) 
					{
							mes = 0;
							anio = anio + 1; 
					}
					else
							mes = mes + 1;	
					
					this.calcularMes(mes,anio);
					//console.log("FI:", FI);
					//console.log("FF:", FF);
			}
			
			Meteor.call('getCobranza', FI, FF, op, function(error, result) {
						//console.log(result);						
						if (result)
						{
								rc.cobranza = result;
								$scope.$apply();
						}
				
			});	
	}
	
  this.selCredito=function(objeto){
	  	
	  	rc.cliente = objeto.cliente;
	  	rc.credito = objeto.credito;	  
	  	console.log(objeto.credito);	
	  	var tc = TiposCredito.findOne(rc.credito.tipoCredito_id);
	  	rc.credito.tipoCredito = tc.nombre;
	  	//var avales = [];
	  	this.ban = !this.ban;
	  	

	  	
      this.selected_credito=objeto.credito.folio;
  }
  this.isSelected=function(objeto){
      return this.selected_credito===objeto;
  }	

var fecha = moment()
	this.guardarNotaCobranza=function(nota){
			console.log(nota);
			
			nota.estatus = true;
			nota.fecha = new Date()
			nota.hora = moment(nota.fecha).format("hh:mm:ss a")
			rc.notaCobranza.usuario = rc.usuario.profile.nombreCompleto
			Notas.insert(nota);
			this.notaCobranza = {}
			$('#myModal').modal('hide');
			toastr.success('Guardado correctamente.');
	}
	this.mostrarNotaCobranza=function(objeto){
		console.log(objeto)
		rc.notaCobranza.cliente= objeto.cliente.profile.nombreCompleto 
		rc.notaCobranza.folioCredito = objeto.credito.folio 
		rc.notaCobranza.recibo= objeto.planPagos[0].numeroPago
		
		 rc.cobranza_id = objeto.credito._id
		 console.log("rc.cobranza_id",rc.cobranza_id)
		 $("#myModal").modal();


	}

	
};