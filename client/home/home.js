angular.module("creditoMio")
.controller("HomeCtrl", HomeCtrl);
 function HomeCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	
 	rc.estaCerrada = false;
 	
 	
 	this.cajero_id = "";
  this.cajeros_id = [];
  this.fechaInicial = new Date();
  this.fechaInicial.setHours(0,0,0,0);
  this.fechaFinal = new Date();
  this.fechaFinal.setHours(23,0,0,0);
 	

 	let cajasS = this.subscribe('cajas',()=>{
		return [{ estatus : true }]
	}); 

	
	this.subscribe('cajero',()=>{
		return [{ "profile.sucursal_id"	: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
							"profile.estatus" 		: true,
							roles : ["Cajero"]}]
	}); 
	let pagosS = this.subscribe('pagos',()=>{
		return [{ sucursalPago_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "", 
							fechaPago : { $gte : rc.getReactively("fechaInicial"), $lte : rc.getReactively("fechaFinal")}, 
							estatus: 1
					 }]
	});
	
	this.helpers({
		

		cajeros : () => {
			if(Meteor.user()){
			  var usuarios = Meteor.users.find({roles : ["Cajero"]}).fetch();
			  var cajerosCM = [];
			  _.each(usuarios, function(usuario){
					  cajerosCM.push(usuario);
			  });
			  rc.cajeros_id = _.pluck(cajerosCM, "_id");
			  
			  return cajerosCM;
		  }
			
		},	
		catidadCobranzaDiaria :() =>{								
			var arreglo = [];

		  if(pagosS.ready()){
				
			  _.each(this.cajeros, function(cajero){

				  var suma = 0;
				   var pago = Pagos.find({usuarioCobro_id: cajero._id,
					   											fechaPago: {$gte: rc.getReactively("fechaInicial"),$lt: rc.getReactively("fechaFinal")}}).fetch();

				   _.each(pago, function(p){
					   	suma += Number(parseFloat(p.totalPago).toFixed(2));
				   })
				   arreglo.push(suma);
			  });

		  }
			
			return arreglo;
		},
		cajerosNombres : () => {
		  
		  var cajerosNombre = [];
			var cajeros = Meteor.users.find({roles : ["Cajero"]}).fetch();
			
			if (cajeros != undefined)
			{
					_.each(cajeros, function(cajero){
					  var nombre = cajero.profile.nombre + " " + cajero.profile.apellidoPaterno + " " + cajero.profile.apellidoMaterno;
					  cajerosNombre.push(nombre);
				  });	
				
			}		
	
		  return cajerosNombre;
	  },
		graficaCajeros : () => {
		  
		  data = [];
		  
			if(pagosS.ready()){
				data.push({
				  name: "Cajeros",
				  data: rc.getReactively("catidadCobranzaDiaria")
				});				
			}
			
			$('#container').highcharts( {
			    chart: { type: 'column' },
			    title: { text: 'Cobranza Diaria' },
			    subtitle: {
		        text: 'Fecha: ' + moment(rc.getReactively("fechaInicial")).format('LL')
			    },
			    xAxis: {
		        categories: rc.cajerosNombres,
		        crosshair: true
			    },
			    yAxis: {
		        min: 0,
		        title: {
		          text: 'Cantidad $'
		        }
			    },
			    tooltip: {
		        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
		        pointFormat:  '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
		            					'<td style="color:{series.color};padding:0"><b>{point.y:.0f} </b></td></tr>',
		        footerFormat: '</table>',
		        shared: true,
		        useHTML: true
			    },
			    plotOptions: {
		        column: {
		          pointPadding: 0.2,
		          borderWidth: 0
		        }
			    },
			    series: data
				}
			);
			return data;
	  }
	});
 	
 	
 	
 	
};