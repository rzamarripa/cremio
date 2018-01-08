Meteor.methods({
	getcartaRecordatorio: function (objeto) {
		//console.log(objeto,"recordatori")
   // var produccion = "/home/cremio/archivos/";
		
		var fs = require('fs') ;
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		////var produccion = "/home/cremio/archivos/";
		var produccion = "/home/cremio/archivos/";
		
		var content = fs
    							.readFileSync(produccion+"RECORDATORIOS.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
		
		var fecha = new Date();
		var f = fecha;
    fecha = fecha.getDate()+'-'+(fecha.getMonth()+1)+'-'+fecha.getFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
    var cliente =objeto.cliente.profile.nombreCompleto
    var nombreCliente  = cliente.toUpperCase();
    var calle = objeto.cliente.profile.calle
    var calleCLiente = calle.toUpperCase();
    var colonia = objeto.cliente.profile.colonia
    var coloniaCliente = colonia.toUpperCase();
    var ciudad = objeto.cliente.profile.ciudad
    var ciudadCliente = ciudad.toUpperCase();
    var estado = objeto.cliente.profile.estado
    var estadoCliente = estado.toUpperCase();
    var pais = objeto.cliente.profile.pais
    var paisCliente = pais.toUpperCase();

		doc.setData({		        nombreCompleto: 		nombreCliente, 
									calle: 					calleCLiente,
									numero: 				objeto.cliente.profile.numero,
									colonia: 				coloniaCliente,
									codigoPostal: 	        objeto.cliente.profile.codigoPostal,
									ciudad: 				ciudadCliente,
									estado: 				estadoCliente,
									pais: 					paisCliente,
									folio: 					objeto.credito.folio,
									saldoTotal: 		    objeto.credito.saldoTotal,
									pagosVencidos: 	        objeto.credito.pagosVencidos,
									letra: 					objeto.credito.letra,
									saldoActualizado:       objeto.credito.saldoActualizado,
									pagosVencidos:          objeto.credito.pagosVencidos,
									fechaEmision: 	        fecha});
									
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"RECORDATORIOSSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"RECORDATORIOSSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getcartaUrgente: function (objeto) {
	//console.log(objeto,"URGENTE")
		
		
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = "/home/cremio/archivos/";
		//var produccion = "/home/cremio/archivos/";
				 
		
		
		var content = fs
    							.readFileSync(produccion+"URGENTE.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
		
		var fecha = new Date();
		var f = fecha;
	    fecha = fecha.getDate()+'-'+(fecha.getMonth()+1)+'-'+fecha.getFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    var cliente =objeto.cliente.profile.nombreCompleto
	    var nombreCliente  = cliente.toUpperCase();
	    var calle = objeto.cliente.profile.calle
	    var calleCLiente = calle.toUpperCase();
	    var colonia = objeto.cliente.profile.colonia
	    var coloniaCliente = colonia.toUpperCase();
	    var ciudad = objeto.cliente.profile.ciudad
	    var ciudadCliente = ciudad.toUpperCase();
	    var estado = objeto.cliente.profile.estado
	    var estadoCliente = estado.toUpperCase();
	    var pais = objeto.cliente.profile.pais
	    var paisCliente = pais.toUpperCase();
		
		doc.setData({				nombreCompleto: 		nombreCliente, 
									calle: 					calleCLiente,
									numero: 				objeto.cliente.profile.numero,
									colonia: 				coloniaCliente,
									codigoPostal: 	        objeto.cliente.profile.codigoPostal,
									ciudad: 				ciudadCliente,
									estado: 				estadoCliente,
									pais: 					paisCliente,
									folio: 					objeto.credito.folio,
									saldoTotal: 		    objeto.credito.saldoTotal,
									pagosVencidos: 	        objeto.credito.pagosVencidos,
									letra: 					objeto.credito.letra,
									saldoActualizado:       objeto.credito.saldoActualizado,
									avales:		   			objeto.credito.avales,
									pagosVencidos:          objeto.credito.pagosVencidos,
									fechaEmision: 	        fecha});
									
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"URGENTESSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"URGENTESSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },


 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////5

  getcartaCertificado: function (objeto,objeto_id) {
	//console.log(objeto,"certificacionPatrimonial")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
		
		//var produccion = "/home/cremio/archivos/";
		//var produccion = "/home/cremio/archivos/";
				 
		
		
		var content = fs
    	   .readFileSync(produccion+"certificacionPatrimonial.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
		
		var fecha = new Date();
		var f = fecha;
	    fecha = fecha.getDate()+'-'+(fecha.getMonth()+1)+'-'+fecha.getFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    var cliente =objeto.cliente.profile.nombreCompleto
	    var nombreCliente  = cliente.toUpperCase();
	    var calle = objeto.cliente.profile.calle
	    var calleCLiente = calle.toUpperCase();
	    var colonia = objeto.cliente.profile.colonia
	    var coloniaCliente = colonia.toUpperCase();
	    var ciudad = objeto.cliente.profile.ciudad
	    var ciudadCliente = ciudad.toUpperCase();
	    var estado = objeto.cliente.profile.estado
	    var estadoCliente = estado.toUpperCase();
	    var pais = objeto.cliente.profile.pais
	    var paisCliente = pais.toUpperCase();


		
		doc.setData({				nombreCompleto: 		nombreCliente, 
									calle: 					calleCLiente,
									numero: 				objeto.cliente.profile.numero,
									colonia: 				coloniaCliente,
									codigoPostal: 	        objeto.cliente.profile.codigoPostal,
									ciudad: 				ciudadCliente,
									estado: 				estadoCliente,
									pais: 					paisCliente,
									folio: 					objeto.credito.folio,
									saldoTotal: 		    objeto.credito.saldoTotal,
									pagosVencidos: 	        objeto.credito.pagosVencidos,
									letra: 					objeto.credito.letra,
									saldoActualizado:       objeto.credito.saldoActualizado,
									fechaEmision: 	        fecha,
									avales:		   			objeto.credito.avales});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccionSalida+"certificacionPatrimonialSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"certificacionPatrimonialSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getReferencias: function (idReferencia) {
			var referencia = Personas.findOne(idReferencia);
			//console.log("esta es la referencia",referencia)
			return referencia;
	},
	getReferenciasP: function (idReferencia) {
			var referencia = ReferenciasPersonales.findOne(idReferencia);
			//console.log("esta es la referencia",referencia)
			return referencia;
	},
	getDocs: function (idReferencia) {
			var referencia = Documentos.findOne(idReferencia);
			//console.log("esta es la referencia",referencia)
			return referencia;
	},
	getPeople: function (idReferencia) {
			var persona = Meteor.users.findOne(idReferencia);
			
				_.each(persona, function(objeto){
						objeto.nacionalidadCliente = Nacionalidades.findOne(objeto.nacionalidad_id);
						objeto.coloniaCliente = Colonias.findOne(objeto.colonia_id);
						objeto.estadoCliente = Estados.findOne(objeto.estado_id);
						objeto.municipioCliente = Municipios.findOne(objeto.municipio_id);
						objeto.paisCliente = Paises.findOne(objeto.pais_id);
						objeto.ocupacionCliente = Ocupaciones.findOne(objeto.ocupacion_id);
						objeto.ciudadCliente = Ciudades.findOne(objeto.ciudad_id);
						objeto.sucursales = Sucursales.findOne(objeto.sucursal_id);
						objeto.estadoCivilCliente = EstadoCivil.findOne(objeto.estadoCivil_id);
						objeto.empresa = Empresas.findOne(objeto.empresa_id);
						

						if (objeto.empresa != undefined)
						{
							 objeto.paisEmpresa = Paises.findOne(objeto.empresa.pais_id);
							 objeto.estadoEmpresa = Estados.findOne(objeto.empresa.estado_id);
							 objeto.municipioEmpresa = Municipios.findOne(objeto.empresa.municipio_id);
							 objeto.ciudadEmpresa = Ciudades.findOne(objeto.empresa.ciudad_id);	 
							 objeto.coloniaEmpresa = Colonias.findOne(objeto.empresa.colonia_id);	 
							 							 
						}	 						
					/*
	
						objeto.referencias = [];
						_.each(objeto.referenciasPersonales_ids, function(item){
							var referencias = ReferenciasPersonales.findOne(item.referenciaPersonal_id);
							objeto.referencias.push(referencias);	
						})
*/


				});

				//console.log(persona,"termina")
				
			//console.log("esta es la referencia",referencia)
			return persona;
	},

	obAvales: function (idReferencia) {
			var aval = Avales.findOne(idReferencia);
			//console.log(aval,"avales server")
			
			
				
					aval.profile.nacionalidadAval = Nacionalidades.findOne(aval.profile.nacionalidad_id);
					aval.profile.nacionalidad = aval.profile.nacionalidadAval.nombre
					aval.profile.coloniaAval = Colonias.findOne(aval.profile.colonia_id);
					aval.profile.colonia = aval.profile.coloniaAval.nombre
					aval.profile.estadoAval = Estados.findOne(aval.profile.estado_id);
					aval.profile.estado = aval.profile.estadoAval.nombre
					aval.profile.municipioAval = Municipios.findOne(aval.profile.municipio_id);
					aval.profile.municipio = aval.profile.municipioAval.nombre
					aval.profile.ocupacionAval = Ocupaciones.findOne(aval.profile.ocupacion_id);
					aval.profile.ocupacion = aval.profile.ocupacionAval.nombre
					aval.profile.ciudadAval = Ciudades.findOne(aval.profile.ciudad_id);
					aval.profile.ciudad = aval.profile.ciudadAval.nombre
					aval.profile.sucursalesAval = Sucursales.findOne(aval.profile.sucursal_id);
					aval.profile.sucursal = aval.profile.sucursalesAval.nombre
					

				
				
			return aval;
	},
	
	findSomeShit: function (collection, find, findOne){
		return findOne ? eval(collection).findOne(find) : eval(collection).find(find);
	},
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getFicha: function (objeto,referencia, tipo) {
  	//console.log(objeto.referencias,"FICHA")
  	if (objeto.numeroDistribuidor) {
  		objeto.numeroCliente = objeto.numeroDistribuidor
  	}
		
		
		const formatCurrency = require('format-currency');
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var ImageModule = require('docxtemplater-image-module');
		
		var unoconv = require('better-unoconv');
    var future = require('fibers/future');
		
		var templateType = (tipo === 'pdf') ? '.docx' : (tipo === 'excel' ? '.xlsx' : '.docx');
    if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/" + "FICHASOCIO" + templateType;
      var produccionFoto = publicPath + "public/fotos/" + "FICHASOCIO";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "plantillas/" + "FICHASOCIO" + templateType;
      var produccionFoto = publicPath + "fotos/" + "FICHASOCIO";
      var produccionSalida = "/home/cremio/archivos/";
    }
		

		var opts = {}
			opts.centered = false;
			opts.getImage=function(tagValue, tagName) {
					var binaryData =  fs.readFileSync(tagValue,'binary');
					return binaryData;
		}
		
		opts.getSize=function(img,tagValue, tagName) {
		    return [180,160];
		}
		
		var imageModule=new ImageModule(opts);

		var content = fs.readFileSync(produccion, "binary");

		var res = new future();
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.attachModule(imageModule)
								.loadZip(zip).setOptions({nullGetter: function(part) {
				if (!part.module) {
				return "";
				}
				if (part.module === "rawxml") {
				return "";
				}
				return "";
		}});


		
		var fecha = new Date();
		var hora = moment(fecha).format("hh:mm:ss a");

		fecha.setHours(0,0,0,0);
	  var fechaEmision = new Date()

    var f = String(objeto.foto);
		objeto.foto = f.replace('data:image/jpeg;base64,', '');

		var bitmap = new Buffer(objeto.foto, 'base64');
		
		fs.writeFileSync(produccionSalida + objeto.nombreCompleto + ".jpeg", bitmap);
		objeto.foto = produccionSalida + objeto.nombreCompleto + ".jpeg";
			
		//objeto.referenciasPersonales_ids.referencia .find(objeto.referenciasPersonales_ids.r		
		
		objeto.fechaCreacion =moment(objeto.fechaCreacion).format("DD-MM-YYYY")
		objeto.fechaNacimiento =moment(objeto.fechaNacimiento).format("DD-MM-YYYY")
		objeto.fechaEmision = fechaEmision
		objeto.fechaEmision= moment(objeto.fechaEmision).format("DD-MM-YYYY")

	  objeto.pais = objeto.paisCliente.nombre
		objeto.ciudad = objeto.ciudadCliente.nombre
		objeto.sucursal = objeto.sucursales.nombreSucursal
		objeto.colonia = objeto.coloniaCliente.nombre
		objeto.municipio = objeto.municipioCliente.nombre
		objeto.estado = objeto.estadoCliente.nombre
		objeto.nacionalidad = objeto.nacionalidadCliente.nombre
		objeto.estadoCivil = objeto.estadoCivilCliente.nombre
		objeto.ocupacion = objeto.ocupacionCliente.nombre
		objeto.cp = objeto.codigoPostal
		objeto.telefonoMovilContacto = objeto.celular
		objeto.telefonoContacto = objeto.particular
		objeto.nombreConyu = objeto.nombreConyuge
		objeto.empresaC = Empresas.findOne(objeto.empresa_id);
		objeto.empresaC.municipio = Municipios.findOne(objeto.empresaC.municipio_id);
		objeto.municipioEmpresa = objeto.empresaC.municipio.nombre
		objeto.empresaC.municipio = Municipios.findOne(objeto.empresaC.municipio_id);
		objeto.municipioEmpresa = objeto.empresaC.municipio.nombre
		objeto.empresaC.estado = Estados.findOne(objeto.empresaC.estado_id);
		objeto.estadoEmpresa = objeto.empresaC.estado.nombre
		objeto.empresaC.colonia = Colonias.findOne(objeto.empresaC.colonia_id);
		objeto.coloniaEmpresa = objeto.empresaC.colonia.nombre
		objeto.empresaC.pais = Paises.findOne(objeto.empresaC.pais_id);
		objeto.paisEmpresa = objeto.empresaC.pais.nombre
		objeto.numeroEmpresa = objeto.empresaC.no
		objeto.empresa = objeto.empresaC.nombre
		objeto.calleEmpresa = objeto.empresaC.calle
		objeto.cpEmpresa	= objeto.empresaC.codigoPostal;
		objeto.numeroEmpresa = objeto.empresaC.numero
		
		objeto.ingresosPersonales 	= formatCurrency(objeto.ingresosPersonales);
		objeto.ingresosConyuge		 	= formatCurrency(objeto.ingresosConyuge);
		objeto.otrosIngresos				= formatCurrency(objeto.otrosIngresos);
		objeto.gastosFijos 					= formatCurrency(objeto.gastosFijos);
		objeto.gastosEventuales 		= formatCurrency(objeto.gastosEventuales);
		
		doc.setData({	item					: objeto,
									foto					: objeto.foto,
									referencias		: referencia,
									fechaEmision 	: objeto.fechaEmision,
									hora					: hora,
								});								
		doc.render(); 
		var buf = doc.getZip().generate({type:"nodebuffer"});
 
		/*
		fs.writeFileSync(produccion+"FICHASOCIOSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"FICHASOCIOSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		*/
		
    var rutaOutput = (Meteor.isDevelopment ? publicPath + "public/generados/" : produccionSalida) + "FICHASOCIOOut" + objeto.nombreCompleto + templateType;
    //var rutaOutputpdf = (Meteor.isDevelopment ? publicPath + "public/generados/" : produccionSalida) + "FICHASOCIOOut.pdf" ;
     
    fs.writeFileSync(rutaOutput, buf);
     
		unoconv.convert(rutaOutput, 'pdf', function(err, result) {
        if(!err){
          fs.unlink(rutaOutput);
          res['return']({ uri: 'data:application/pdf;base64,' + result.toString('base64'), nombre: "FICHASOCIOOut" + '.pdf' });
        }else{
          res['return']({err: err});
          console.log("Error al convertir pdf:", err);
        }
     });

    return res.wait();
				
  },

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getRecibos: function (objeto) {
	
		//console.log(objeto,"planPagos")
		const formatCurrency = require('format-currency')
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
		
						 
		var content = fs.readFileSync(produccion+"RECIBOS.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
																					if (!part.module) {
																					return "";
																					}
																					if (part.module === "rawxml") {
																					return "";
																					}
																					return "";
																				}});
		
		var fecha = new Date();
		var f = fecha;
	  fecha = fecha.getDate()+'-'+(fecha.getMonth()+1)+'-'+fecha.getFullYear();
	  
		_.each(objeto,function(item){
	      
	    	item.fechaLimite   = moment(item.fechaLimite).format("DD-MM-YYYY");
	      item.numeroCliente = item.cliente.profile.numeroCliente; 
	      
	      item.cargo = formatCurrency(item.cargo);
	      item.saldoAnterior = formatCurrency(item.saldoAnterior);
	      item.saldoActual = formatCurrency(item.saldoActual);
	      
	    				
				var num = (item.numeroPago + 1);
				var pp = PlanPagos.findOne({credito_id: item.credito._id, numeroPago: num});

				if (pp) {
	      	item.proximoPago = moment(pp.fechaLimite).format("DD-MM-YYYY"); 
	      }else{
	      	item.proximoPago = "No hay próximo pago";
	      }
				
				
				
		});
		
		doc.setData({	items: 		objeto,
									fecha:    fecha,
								});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccionSalida+"RECIBOSSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"RECIBOSSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },

  getCreditoReporte: function (objeto,credito,avales,total) {
    	//console.log(total,"total")
	
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
		
	   // var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"ReporteCredito.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
		var fecha = new Date();

		var f = fecha;
	    fecha = fecha.getDate()+'-'+(fecha.getMonth()+1)+'-'+fecha.getFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	 	 	//objeto.cargo.toLocaleString()
	 	const formatCurrency = require('format-currency')
	 	 	_.each(objeto,function(item){
	 	 		
	 	 		//console.log(item,"Credito")
	 	 		
	 	 		//item.fechaLimite = item.fechaLimite.getDate()+'-'+(item.fechaLimite.getMonth()+1)+'-'+item.fechaLimite.getFullYear();
	 	 		 //if (item.fechaLimite.length < 2) item.fechaLimite = '0' + item.fechaLimite;
	 	 		   item.cargo = parseFloat(item.cargo.toFixed(2).toLocaleString())
	 	 		   item.cargo = formatCurrency(item.cargo)
	 	 		   //(formatCurrency(item.cargo)
	 	 		   item.liquidar = parseFloat(item.liquidar.toFixed(2))
	 	 		   item.liquidar = formatCurrency(item.liquidar)
	 	 		    item.capital = parseFloat(item.capital.toFixed(2))
	 	 		    item.capital = formatCurrency(item.capital)
	 	 		    item.interes = parseFloat(item.interes.toFixed(2))
	 	 		    item.interes = formatCurrency(item.interes)
	 	 		    item.seguro = parseFloat(item.seguro.toFixed(2))
	 	 		    item.seguro = formatCurrency(item.seguro)
	 	 		    item.iva = parseFloat(item.iva.toFixed(2))
	 	 		    item.iva = formatCurrency(item.iva)

	 	 		    if (item.numeroPago < 10) {
	 	 		    	item.numeroPago = "0"+item.numeroPago
	 	 		    }

	 	 		    
	 	 		    var dia = item.fechaLimite.getDate()
	 	 		    var mes = item.fechaLimite.getMonth()+1
	 	 		    var anio = item.fechaLimite.getFullYear()
	 	 		    if (Number(dia) < 10) {
	 	 		    	dia = "0" + dia;
	 	 		    }
	 	 		    if (Number(mes) < 10) {
	 	 		    	mes = "0" + mes;
	 	 		    }
	 	 		    item.fechaLimite = dia+ "-" + mes + "-" + anio

	 	 		    //console.log(dia,"el dia",mes,"el mes",item.fechaLimite,"la fecha")

	 	 	});
	 	 	credito.capitalSolicitado.toLocaleString()
	 	 	var length = objeto.length
	 	 	if (length < 10) {
	 	 	    length = "0"+length
	 	     }
	 	    credito.capitalSolicitado = parseFloat(credito.capitalSolicitado.toFixed(2));
	 	    total.sumatoria = parseFloat(total.sumatoria.toFixed(2));
	 	    credito.capitalSolicitado = formatCurrency(credito.capitalSolicitado)
	 	    total.sumatoria = formatCurrency(total.sumatoria)
	 	    var Ti = TiposCredito.findOne(credito.tipoCredito_id)
	 	 

		
		doc.setData({				planPagos: 	  objeto,
									length:       length,
									fecha:        fecha,
									cliente:      credito.nombre,
									periodo:      credito.periodoPago,
									duracion:     credito.duracionMeses,
									capitalSolicitado:      credito.capitalSolicitado.toLocaleString(),
									total:        total.sumatoria.toLocaleString(),
									tasa:         credito.tasa,
									Ti:           Ti.nombre,
									//tipoCredito:

				  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccionSalida+"ReporteCreditoSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"ReporteCreditoSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
  ReporteCobranza: function (objeto,inicial,final,tiposIngreso) {
	
		//console.log(objeto,"creditos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
						 
		var content = fs
    	   .readFileSync(produccion+"reporteDiarioCobranza.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		const formatCurrency = require('format-currency')


		var fecha = new Date();
		var f = fecha;
		var fechaInicial = inicial;
		var fechaFinal = final;

    
	  var suma = 0
		var sumaInter = 0
		var sumaIva = 0
		var sumaSeguro = 0
		totalcobranza = 0
	    _.each(objeto,function(item){
	    	item.fechaPago = moment(item.fechaPago).format("DD-MM-YYYY")
	    	moment(item.fechaInicial).format("DD-MM-YYYY")
	      moment(item.fechaFinal).format("DD-MM-YYYY")
	      if (item.descripcion == "Recibo") {
	      	item.movimiento = "R"
	      }else{
	      	item.movimiento = "C"
	      }
	    	  
	       suma += item.pagoCapital;
	       sumaInter += item.pagoInteres;
	       sumaIva += item.pagoIva;
	       sumaSeguro += item.pagoSeguro;
	       totalcobranza += parseFloat(item.totalPago);
	       

	        item.cargo = parseFloat(item.totalPago.toFixed(2))
	        item.cargo = formatCurrency(item.cargo)
	        item.interes = parseFloat(item.pagoInteres.toFixed(2))
	        item.interes = formatCurrency(item.interes)
	        item.iva = parseFloat(item.pagoIva.toFixed(2))
	        item.iva = formatCurrency(item.iva)
	        item.seguro = parseFloat(item.pagoSeguro.toFixed(2))
	        item.seguro = formatCurrency(item.seguro)
	        item.pago = parseFloat(item.pagoCapital.toFixed(2))
	        item.pago = formatCurrency(item.pago)
	        if (item.folio < 10) {
	 	 		item.folio = "0"+item.folio
	 	 	}
	 	 	if (item.numeroPago < 10) {
	 	 		item.numeroPago = "0"+item.numeroPago
	 	 	}
	 	 	if (item.numeroPagos < 10) {
	 	 		item.numeroPagos = "0"+item.numeroPagos
	 	 	}
	    });
	    

 		    var dia = fecha.getDate()
 		    var mes = fecha.getMonth()+1
 		    var anio = fecha.getFullYear()
 		    if (Number(dia) < 10) {
 		    	dia = "0" + dia;
 		    }
 		    if (Number(mes) < 10) {
 		    	mes = "0" + mes;
 		    }
 		    fecha = dia+ "-" + mes + "-" + anio;

 		    var dia2 = fechaInicial.getDate()
 		    var mes2 = fechaInicial.getMonth()+1
 		    var anio2 = fechaInicial.getFullYear()
 		    if (Number(dia2) < 10) {
 		    	dia2 = "0" + dia2;
 		    }
 		    if (Number(mes2) < 10) {
 		    	mes2 = "0" + mes2;
 		    }
 		    fechaInicial = dia2+ "-" + mes2 + "-" + anio2;

 		    var dia3 = fechaFinal.getDate()
 		    var mes3 = fechaFinal.getMonth()+1
 		    var anio3 = fechaFinal.getFullYear()
 		    if (Number(dia3) < 10) {
 		    	dia3 = "0" + dia3;
 		    }
 		    if (Number(mes3) < 10) {
 		    	mes3 = "0" + mes3;
 		    }
 		    fechaFinal = dia3 + "-" + mes3 + "-" + anio3;
 		    
 		    parseFloat(suma.toFixed(2))
 		    suma = formatCurrency(suma)
 		    parseFloat(sumaInter.toFixed(2))
 		    sumaInter = formatCurrency(sumaInter)
 		    parseFloat(sumaIva.toFixed(2))
 		    sumaIva = formatCurrency(sumaIva)
 		    parseFloat(sumaSeguro.toFixed(2))
 		    sumaSeguro = formatCurrency(sumaSeguro)
 		    parseFloat(totalcobranza.toFixed(2))
 		    totalcobranza = formatCurrency(totalcobranza)
 				
 				//Tipos de Ingreso
 				_.each(tiposIngreso, function(ti){
	 				ti.total = formatCurrency(ti.total)
 				});
 				
 				var hora = moment(new Date()).format("hh:mm:ss a");
		
	      doc.setData({				
    	            items: 		      objeto,
									fecha:          fecha,
									hora:						hora,
									inicial:        fechaInicial,
									final:          fechaFinal,
									sumaCapital:    suma,
									sumaIntereses:  sumaInter,
									sumaIva:        sumaIva,
									totalSeguro:    sumaSeguro,
									totalCobranza:  totalcobranza,
									tiposIngreso	:	tiposIngreso
	
			  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccionSalida+"reporteDiarioCobranzaSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"reporteDiarioCobranzaSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
  ReporteCarteraVencida: function (objeto, tipo) {
	
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var unoconv = require('better-unoconv');
    var future = require('fibers/future');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		var templateType = (tipo === 'pdf') ? '.docx' : (tipo === 'excel' ? '.xlsx' : '.docx');
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
						 
		var content = fs
    	   .readFileSync(produccion+"ReporteCarteraVencida.docx", "binary");
		var zip = new JSZip(content);
		var res = new future();
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		const formatCurrency = require('format-currency');


		var fecha = new Date();
		var hora = moment(fecha).format("hh:mm:ss a");
   
		var numeroClientes	= 0;
		var sumaTotal	= 0;
		var sumaSaldo = 0;
		var sumaCargosMoratorios = 0;
		var sumaPorVencer = 0;
		var sumaTotalVencido = 0;
		var suma7Dias = 0;
		var suma14Dias = 0;
		var suma21Dias = 0;
		var suma28Dias = 0;
		var sumaMas28Dias = 0;
		
		
	  _.each(objeto,function(cliente){
		  	
		
				numeroClientes 				+= 1;
		  	sumaTotal 						+= Number(parseFloat(cliente.total).toFixed(2));
				sumaSaldo 						+= Number(parseFloat(cliente.saldo).toFixed(2));
	  		sumaCargosMoratorios 	+= Number(parseFloat(cliente.saldoCargosMoratorios).toFixed(2));
	  		sumaPorVencer 				+= Number(parseFloat(cliente.porVencer).toFixed(2));
	  		sumaTotalVencido 			+= Number(parseFloat(cliente.totalVencido).toFixed(2));
	  		suma7Dias 						+= Number(parseFloat(cliente.sieteDias).toFixed(2));	  		
				suma14Dias 						+= Number(parseFloat(cliente.siete14Dias).toFixed(2));
				suma21Dias 						+= Number(parseFloat(cliente.catorce21Dias).toFixed(2));
				suma28Dias 						+= Number(parseFloat(cliente.ventiuno28Dias).toFixed(2));
				sumaMas28Dias 				+= Number(parseFloat(cliente.mas28Dias).toFixed(2));

	  		cliente.total = formatCurrency(cliente.total);
	  		cliente.saldo = formatCurrency(cliente.saldo);
	  		cliente.saldoCargosMoratorios = formatCurrency(cliente.saldoCargosMoratorios);
	  		cliente.porVencer = formatCurrency(cliente.porVencer);
	  		cliente.totalVencido = formatCurrency(cliente.totalVencido);
	  		cliente.sieteDias = formatCurrency(cliente.sieteDias);	  		
				cliente.siete14Dias = formatCurrency(cliente.siete14Dias);
				cliente.catorce21Dias = formatCurrency(cliente.catorce21Dias);
				cliente.ventiuno28Dias = formatCurrency(cliente.ventiuno28Dias);
				cliente.mas28Dias = formatCurrency(cliente.mas28Dias);
	  	
	  });
	   
		sumaTotal 						= formatCurrency(sumaTotal);
		sumaSaldo 						= formatCurrency(sumaSaldo);
		sumaCargosMoratorios 	= formatCurrency(sumaCargosMoratorios);
		sumaPorVencer 				= formatCurrency(sumaPorVencer);
		sumaTotalVencido 			= formatCurrency(sumaTotalVencido);
		suma7Dias 						= formatCurrency(suma7Dias);	  		
		suma14Dias 						= formatCurrency(suma14Dias);
		suma21Dias 						= formatCurrency(suma21Dias);
		suma28Dias 						= formatCurrency(suma28Dias);
		sumaMas28Dias 				= formatCurrency(sumaMas28Dias);


    var dia = fecha.getDate()
    var mes = fecha.getMonth()+1
    var anio = fecha.getFullYear()
    if (Number(dia) < 10) {
    	dia = "0" + dia;
    }
    if (Number(mes) < 10) {
    	mes = "0" + mes;
    }
    fecha = dia+ "-" + mes + "-" + anio;
		
	  doc.setData({				
	            items									:	objeto,
							fecha									: fecha,
							hora									:	hora,
							sumaTotal							: sumaTotal,
							sumaSaldo							: sumaSaldo,
							sumaCargosMoratorios 	: sumaCargosMoratorios,
							sumaPorVencer					: sumaPorVencer,
							sumaTotalVencido			: sumaTotalVencido,
							suma7Dias							: suma7Dias,
							suma14Dias						: suma14Dias,
							suma21Dias						: suma21Dias,
							suma28Dias						: suma28Dias,
							sumaMas28Dias					: sumaMas28Dias,
							numeroClientes				: numeroClientes
	  });
					
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		//fs.writeFileSync(produccionSalida+"ReporteCarteraVencidaSalida.docx",buf);		
		
		
		var rutaOutput = (Meteor.isDevelopment ? publicPath + "public/generados/" : produccionSalida) + "ReporteCarteraVencidaOut" + objeto.nombreCompleto + templateType;
    //var rutaOutputpdf = (Meteor.isDevelopment ? publicPath + "public/generados/" : produccionSalida) + "FICHASOCIOOut.pdf" ;
     
    fs.writeFileSync(rutaOutput, buf);
    
		unoconv.convert(rutaOutput, 'pdf', function(err, result) {
        if(!err){
          fs.unlink(rutaOutput);
          res['return']({ uri: 'data:application/pdf;base64,' + result.toString('base64'), nombre: "ReporteCarteraVencidaOut" + '.pdf' });
        }else{
          res['return']({err: err});
          console.log("Error al convertir pdf:", err);
        }
     });

    return res.wait();

		
				
		//Pasar a base64
		// read binary data
   /*  var bitmap = fs.readFileSync(produccionSalida+"ReporteCarteraVencidaSalida.docx"); */
    
    // convert binary data to base64 encoded string
    //return new Buffer(bitmap).toString('base64');
    
    
    
    
		
  },
  ReporteCreditos: function (objeto,inicial,final) {
	
		//console.log(objeto,"fwfe ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
    
		//var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"ReporteDiarioCreditos.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
			const formatCurrency = require('format-currency')
			var fecha = new Date();
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final
	   
      var suma = 0
      var sumaSol = 0
	    _.each(objeto,function(item){
	    	item.fechaEntrega = moment(item.fechaEntrega).format("DD-MM-YYYY")
	    	suma = item.sumaCapital
	    	sumaSol = item.sumaAPagar
	    	item.numeroCliente = item.numeroCliente + "";
	    	item.adeudoInicial = parseFloat(item.adeudoInicial.toFixed(2))
	    	item.adeudoInicial = formatCurrency(item.adeudoInicial)
	    	item.saldoActual = parseFloat(item.saldoActual.toFixed(2))
	    	item.saldoActual = formatCurrency(item.saldoActual)
	    	item.capitalSolicitado = parseFloat(item.capitalSolicitado.toFixed(2))
	    	item.capitalSolicitado = formatCurrency(item.capitalSolicitado)
	    	 if (item.folio < 10) {
	 	 		item.folio = "0"+item.folio
	 	 	}
	 	 	if (item.numeroPagos < 10) {
	 	 		item.numeroPagos = "0"+item.numeroPagos
	 	 	}

	    });	       
	 		    
 		    var dia = fecha.getDate()
 		    var mes = fecha.getMonth()+1
 		    var anio = fecha.getFullYear()
 		    if (Number(dia) < 10) {
 		    	dia = "0" + dia;
 		    }
 		    if (Number(mes) < 10) {
 		    	mes = "0" + mes;
 		    }
 		    fecha = dia+ "-" + mes + "-" + anio

 		    var dia2 = fechaInicial.getDate()
 		    var mes2 = fechaInicial.getMonth()+1
 		    var anio2 = fechaInicial.getFullYear()
 		    if (Number(dia2) < 10) {
 		    	dia2 = "0" + dia2;
 		    }
 		    if (Number(mes2) < 10) {
 		    	mes2 = "0" + mes2;
 		    }
 		    fechaInicial = dia2+ "-" + mes2 + "-" + anio2

 		    var dia3 = fechaFinal.getDate()
 		    var mes3 = fechaFinal.getMonth()+1
 		    var anio3 = fechaFinal.getFullYear()
 		    if (Number(dia3) < 10) {
 		    	dia3 = "0" + dia3;
 		    }
 		    if (Number(mes3) < 10) {
 		    	mes3 = "0" + mes3;
 		    }
 		    fechaFinal = dia3+ "-" + mes3 + "-" + anio3
 		    parseFloat(sumaSol.toFixed(2))
 		    sumaSol = formatCurrency(sumaSol)
 		    parseFloat(suma.toFixed(2))
 		    suma = formatCurrency(suma)

		
		doc.setData({				
						items: 		 objeto,
						fecha:     fecha,
						inicial:    fechaInicial,
						final:      fechaFinal,
						sumaCapital : suma,
						sumaAPagar: sumaSol,
													
				
				  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccionSalida+"ReporteDiarioCreditosSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"ReporteDiarioCreditosSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
  ReporteCreditosLiquidados: function (objeto,inicial,final) {
	
		//console.log(objeto,"fwfe ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
    
		//var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"ReporteDiarioCreditosLiquidados.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		const formatCurrency = require('format-currency')
			var fecha = new Date();
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final
	    //fecha = fecha.getDate()+'-'+(fecha.getMonth()+1)+'-'+fecha.getFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	     // fInicial = fechaInicial.getDate()+'-'+(fechaInicial.getMonth()+1)+'-'+fechaInicial.getFullYear(); 
	     // fFinal = fechaFinal.getDate()+'-'+(fechaFinal.getMonth()+1)+'-'+fechaFinal.getFullYear(); 
	   
          var suma = 0
          var sumaSol = 0
	    _.each(objeto,function(item){
	    	item.fechaEntrega = moment(item.fechaEntrega).format("DD-MM-YYYY")
	    	suma = item.sumaCapital
	    	sumaSol = item.sumaAPagar
	    	item.numeroCliente = item.numeroCliente + "";
	    	item.adeudoInicial = parseFloat(item.adeudoInicial.toFixed(2))
	    	item.adeudoInicial = formatCurrency(item.adeudoInicial)
	    	item.saldoActual = parseFloat(item.saldoActual.toFixed(2))
	    	item.saldoActual = formatCurrency(item.saldoActual)
	    	item.capitalSolicitado = parseFloat(item.capitalSolicitado.toFixed(2))
	    	item.capitalSolicitado = formatCurrency(item.capitalSolicitado)
	    	 if (item.folio < 10) {
	 	 		item.folio = "0"+item.folio
	 	 	}
	 	 	if (item.numeroPagos < 10) {
	 	 		item.numeroPagos = "0"+item.numeroPagos
	 	 	}

	    });	       
	 		    
 		    var dia = fecha.getDate()
 		    var mes = fecha.getMonth()+1
 		    var anio = fecha.getFullYear()
 		    if (Number(dia) < 10) {
 		    	dia = "0" + dia;
 		    }
 		    if (Number(mes) < 10) {
 		    	mes = "0" + mes;
 		    }
 		    fecha = dia+ "-" + mes + "-" + anio

 		    var dia2 = fechaInicial.getDate()
 		    var mes2 = fechaInicial.getMonth()+1
 		    var anio2 = fechaInicial.getFullYear()
 		    if (Number(dia2) < 10) {
 		    	dia2 = "0" + dia2;
 		    }
 		    if (Number(mes2) < 10) {
 		    	mes2 = "0" + mes2;
 		    }
 		    fechaInicial = dia2+ "-" + mes2 + "-" + anio2

 		    var dia3 = fechaFinal.getDate()
 		    var mes3 = fechaFinal.getMonth()+1
 		    var anio3 = fechaFinal.getFullYear()
 		    if (Number(dia3) < 10) {
 		    	dia3 = "0" + dia3;
 		    }
 		    if (Number(mes3) < 10) {
 		    	mes3 = "0" + mes3;
 		    }
 		    fechaFinal = dia3+ "-" + mes3 + "-" + anio3
 		    parseFloat(sumaSol.toFixed(2))
 		    sumaSol = formatCurrency(sumaSol)
 		    parseFloat(suma.toFixed(2))
 		    suma = formatCurrency(suma)

		
		doc.setData({				
						items: 		 objeto,
						fecha:     fecha,
						inicial:    fechaInicial,
						final:      fechaFinal,
						sumaCapital : suma,
						sumaAPagar: sumaSol,
													
				
				  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccionSalida+"ReporteDiarioCreditosLiquidadosSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"ReporteDiarioCreditosLiquidadosSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
  ReporteMovimientoCuenta: function (objeto,inicial,final) {
	
		//console.log(objeto,"creditos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
		
		//var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"ReporteMovimientoCuentas.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
			var fecha = new Date();
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final
	    fecha = fecha.getDate()+'-'+(fecha.getMonth()+1)+'-'+fecha.getFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    fInicial = fechaInicial.getDate()+'-'+(fechaInicial.getMonth()+1)+'-'+fechaInicial.getFullYear(); 
	    fFinal = fechaFinal.getDate()+'-'+(fechaFinal.getMonth()+1)+'-'+fechaFinal.getFullYear(); 
	    _.each(objeto,function(item){
	    	item.fechaPago = moment(item.fechaPago).format("DD-MM-YYYY")
	    	
	    });
	    
	    //console.log(objeto.planPagos);
		
		doc.setData({				items: 		 objeto,
												fecha:     fecha,
												inicial:    fInicial,
												final:      fFinal,
													
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccionSalida+"ReporteMovimientoCuentasSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"ReporteMovimientoCuentasSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
  ReportesBanco: function (objeto,inicial,final) {
	
		//console.log(objeto,"creditos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }

		
		//var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
		var content = fs
    	   .readFileSync(produccion+"ReporteBancos.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		const formatCurrency = require('format-currency')
			var fecha = new Date();
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final

	     var suma = 0
		   var sumaInter = 0
		   var sumaIva = 0
		   var sumaSeguro = 0
		   totalcobranza = 0
		   
	    _.each(objeto,function(item){
	    	suma += item.pagoCapital
	        sumaInter += item.pagoInteres
	        sumaIva += item.pagoIva
	        sumaSeguro += item.pagoSeguro;
	        totalcobranza += parseFloat(item.totalPago);
	        
	    	item.fechaPago = moment(item.fechaPago).format("DD-MM-YYYY");
	    	item.fechaDeposito = moment(item.fechaDeposito).format("DD-MM-YYYY");
	    	
	    	item.totalPago = parseFloat(item.totalPago.toFixed(2))
	    	item.totalPago = formatCurrency(item.totalPago)
	    	item.pagoInteres = parseFloat(item.pagoInteres.toFixed(2))
	    	item.pagoInteres = formatCurrency(item.pagoInteres)
	    	item.pagoCapital = parseFloat(item.pagoCapital.toFixed(2))
	    	item.pagoCapital = formatCurrency(item.pagoCapital)
	    	item.pagoIva = parseFloat(item.pagoIva.toFixed(2))
	    	item.pagoIva = formatCurrency(item.pagoIva)
	    });
	    

	 		    
 		   var dia = fecha.getDate()
 		    var mes = fecha.getMonth()+1
 		    var anio = fecha.getFullYear()
 		    if (Number(dia) < 10) {
 		    	dia = "0" + dia;
 		    }
 		    if (Number(mes) < 10) {
 		    	mes = "0" + mes;
 		    }
 		    fecha = dia+ "-" + mes + "-" + anio

 		    var dia2 = fechaInicial.getDate()
 		    var mes2 = fechaInicial.getMonth()+1
 		    var anio2 = fechaInicial.getFullYear()
 		    if (Number(dia2) < 10) {
 		    	dia2 = "0" + dia2;
 		    }
 		    if (Number(mes2) < 10) {
 		    	mes2 = "0" + mes2;
 		    }
 		    fechaInicial = dia2+ "-" + mes2 + "-" + anio2

 		    var dia3 = fechaFinal.getDate()
 		    var mes3 = fechaFinal.getMonth()+1
 		    var anio3 = fechaFinal.getFullYear()
 		    if (Number(dia3) < 10) {
 		    	dia3 = "0" + dia3;
 		    }
 		    if (Number(mes3) < 10) {
 		    	mes3 = "0" + mes3;
 		    }
 		    fechaFinal = dia3+ "-" + mes3 + "-" + anio3
 		    //totalcobranza = suma + sumaIva + sumaInter
 		    
        parseFloat(suma.toFixed(2))
 		    suma = formatCurrency(suma)
 		    parseFloat(sumaInter.toFixed(2))
 		    sumaInter = formatCurrency(sumaInter)
 		    parseFloat(sumaIva.toFixed(2))
 		    sumaIva = formatCurrency(sumaIva)
 		    parseFloat(sumaSeguro.toFixed(2))
 		    sumaSeguro = formatCurrency(sumaSeguro)
 		    parseFloat(totalcobranza.toFixed(2))
 		    totalcobranza = formatCurrency(totalcobranza)
		
		doc.setData({				
			            item: 		 objeto,
						fecha:       fecha,
						inicial:     fechaInicial,
						final:       fechaFinal,
						sumaCapital:    suma,
						sumaIntereses:  sumaInter,
						sumaIva:        sumaIva,
						totalSeguro:    sumaSeguro,
						totalCobranza:  totalcobranza,
													
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccionSalida+"ReporteBancosSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"ReporteBancosSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
  contratos: function (contrato,credito,cliente,planPagos,avales) {
	  
	  if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }

    function Unidades(num){

		        switch(num)
		        {
		            case 1: return 'UN';
		            case 2: return 'DOS';
		            case 3: return 'TRES';
		            case 4: return 'CUATRO';
		            case 5: return 'CINCO';
		            case 6: return 'SEIS';
		            case 7: return 'SIETE';
		            case 8: return 'OCHO';
		            case 9: return 'NUEVE';
		        }
		
		        return '';
		    
    }//Unidades()
		function Decenas(num){
		
		        let decena = Math.floor(num/10);
		        let unidad = num - (decena * 10);
		
		        switch(decena)
		        {
		            case 1:
		                switch(unidad)
		                {
		                    case 0: return 'DIEZ';
		                    case 1: return 'ONCE';
		                    case 2: return 'DOCE';
		                    case 3: return 'TRECE';
		                    case 4: return 'CATORCE';
		                    case 5: return 'QUINCE';
		                    default: return 'DIECI' + Unidades(unidad);
		                }
		            case 2:
		                switch(unidad)
		                {
		                    case 0: return 'VEINTE';
		                    default: return 'VEINTI' + Unidades(unidad);
		                }
		            case 3: return DecenasY('TREINTA', unidad);
		            case 4: return DecenasY('CUARENTA', unidad);
		            case 5: return DecenasY('CINCUENTA', unidad);
		            case 6: return DecenasY('SESENTA', unidad);
		            case 7: return DecenasY('SETENTA', unidad);
		            case 8: return DecenasY('OCHENTA', unidad);
		            case 9: return DecenasY('NOVENTA', unidad);
		            case 0: return Unidades(unidad);
		        }
		    }//Unidades()
    function DecenasY(strSin, numUnidades) {
        if (numUnidades > 0)
            return strSin + ' Y ' + Unidades(numUnidades)

        return strSin;
    }//DecenasY()
    function Centenas(num) {
		        let centenas = Math.floor(num / 100);
		        let decenas = num - (centenas * 100);
		
		        switch(centenas)
		        {
		            case 1:
		                if (decenas > 0)
		                    return 'CIENTO ' + Decenas(decenas);
		                return 'CIEN';
		            case 2: return 'DOSCIENTOS ' + Decenas(decenas);
		            case 3: return 'TRESCIENTOS ' + Decenas(decenas);
		            case 4: return 'CUATROCIENTOS ' + Decenas(decenas);
		            case 5: return 'QUINIENTOS ' + Decenas(decenas);
		            case 6: return 'SEISCIENTOS ' + Decenas(decenas);
		            case 7: return 'SETECIENTOS ' + Decenas(decenas);
		            case 8: return 'OCHOCIENTOS ' + Decenas(decenas);
		            case 9: return 'NOVECIENTOS ' + Decenas(decenas);
		        }
		
		        return Decenas(decenas);
		    }//Centenas()
    function Seccion(num, divisor, strSingular, strPlural) {
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let letras = '';

        if (cientos > 0)
            if (cientos > 1)
                letras = Centenas(cientos) + ' ' + strPlural;
            else
                letras = strSingular;

        if (resto > 0)
            letras += '';

        return letras;
    }//Seccion()
    function Miles(num) {
        let divisor = 1000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMiles = Seccion(num, divisor, 'UN MIL', 'MIL');
        let strCentenas = Centenas(resto);

        if(strMiles == '')
            return strCentenas;

        return strMiles + ' ' + strCentenas;
    }//Miles()
    function Millones(num) {
        let divisor = 1000000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMillones = Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
        let strMiles = Miles(resto);

        if(strMillones == '')
            return strMiles;

        return strMillones + ' ' + strMiles;
    }//Millones()
		function NumeroALetras(num, currency) {
        currency = currency || {};
        let data = {
            numero: num,
            enteros: Math.floor(num),
            centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
            letrasCentavos: '',
            letrasMonedaPlural: currency.plural || '',//'PESOS', 'Dólares', 'Bolívares', 'etcs'
            letrasMonedaSingular: currency.singular || '', //'PESO', 'Dólar', 'Bolivar', 'etc'
            letrasMonedaCentavoPlural: currency.centPlural || '',
            letrasMonedaCentavoSingular: currency.centSingular || ''

        };

        if (data.centavos > 0) {
            data.letrasCentavos = 'CON ' + (function () {
                    if (data.centavos == 1)
                        return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoSingular;
                    else
                        return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoPlural;
                })();
        };

        if(data.enteros == 0)
            return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
        if (data.enteros == 1)
            return Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' ' + data.letrasCentavos;
        else
            return Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
    };	
		
		const formatCurrency = require('format-currency');
		
			
		if (avales == undefined) {
			avales = cliente
		}
		if (contrato.periodoPago == "Semanal") {
			contrato.periodoPago = "SEMANAL"
		}
		if (contrato.periodoPago == "Quincenal") {
			contrato.periodoPago = "QUINCENAL"
		}
		if (contrato.periodoPago == "Mensual") {
			contrato.periodoPago = "MENSUAL"
		}

		if (contrato.seguro == undefined) {
			contrato.seguro = 0
		}

  	cliente.nacionalidad = cliente.nacionalidadCliente.nombre
  	cliente.colonia = cliente.coloniaCliente.nombre
  	cliente.estado = cliente.estadoCliente.nombre
  	cliente.ocupacion = cliente.ocupacionCliente.nombre
  	cliente.ciudad = cliente.ciudadCliente.nombre
  	cliente.municipio = cliente.municipioCliente.nombre
  	var all = planPagos[planPagos.length - 1]
  	var total = all.sumatoria
 		_.each(planPagos,function(pp){
		 	pp.importeRegular = parseFloat(pp.importeRegular.toFixed(2))
		 	pp.importeRegular = formatCurrency(pp.importeRegular)
		 	
		 	pp.seguro = parseFloat(pp.seguro.toFixed(2))
		 	pp.seguro = formatCurrency(pp.seguro)
		 	
		 	pp.iva = parseFloat(pp.iva.toFixed(2))
		 	pp.iva = formatCurrency(pp.iva)
		 	if (pp.sumatoria) {pp.sumatoria = parseFloat(pp.sumatoria.toFixed(2))}
		 		pp.sumatoria = formatCurrency(pp.sumatoria)
		 	if (pp.total) {pp.total = parseFloat(pp.total.toFixed(2))}
		 		pp.total = formatCurrency(pp.total)
		 	if (pp.capital) {pp.capital = parseFloat(pp.capital.toFixed(2))}
		 		pp.capital = formatCurrency(pp.capital)
				pp.liquidar = total
		 		total -= (parseFloat(pp.importeRegular).toFixed(2));
		 		pp.liquidar = parseFloat(pp.liquidar.toFixed(2))
		 	  pp.liquidar = formatCurrency(pp.liquidar)
		 	  pp.fechaLimitePago = pp.fechaLimite
		 	  pp.fechaLimitePago =  moment(pp.fechaLimitePago).format("DD-MM-YYYY")	
		});

 		_.each(contrato.garantias,function(item){
	 	item.fechaFiniquito = moment(item.fechaFiniquito).format("DD-MM-YYYY")
	 	item.fechaComercializacion = moment(item.fechaComercializacion).format("DD-MM-YYYY")
	 	if (item.comisionGastos) {
	 	item.comisionGastos = parseFloat(item.comisionGastos.toFixed(2))
	 	item.comisionGastosLetra = NumeroALetras(item.comisionGastos);
	 	item.comisionGastos = formatCurrency(item.comisionGastos)
	    }
	    if (item.porcentajePrestamoGeneral) {
	 	item.porcentajePrestamoGeneral = parseFloat(item.porcentajePrestamoGeneral.toFixed(2))
	 	item.porcentajePrestamoGeneralLetra = NumeroALetras(item.porcentajePrestamoGeneral);
	    }
    if (item.porcentajePrestamoMobiliria) {
				  	    
		 item.porcentajePrestamoMobiliria = parseFloat(item.porcentajePrestamoMobiliria.toFixed(2))
		 item.porcentajePrestamoMobiliariaLetra = NumeroALetras(item.porcentajePrestamoMobiliria);
    }
	    if (item.avaluoGeneral) {
	 	item.avaluoGeneral = parseFloat(item.avaluoGeneral.toFixed(2))
	 	item.avaluoGeneralLetra = NumeroALetras(item.avaluoGeneral);
	 	item.avaluoGeneral = formatCurrency(item.avaluoGeneral)
	    }
	    if (item.avaluoMobiliaria) {
  	 	item.avaluoMobiliaria = parseFloat(item.avaluoMobiliaria.toFixed(2))
  	 	item.avaluoMobiliariaLetra = NumeroALetras(item.avaluoMobiliaria);
  	 	item.avaluoMobiliaria = formatCurrency(item.avaluoMobiliaria);
  	 	console.log(item.avaluoMobiliariaLetra);
	    }
	    if (item.almacenaje) {
	 	item.almacenaje = parseFloat(item.almacenaje.toFixed(2))
	 	item.almacenajeLetra = NumeroALetras(item.almacenaje)}
	 	item.almacenaje = formatCurrency(item.almacenaje)
	 	if (item.comercializacion) {
	 	item.comercializacion = parseFloat(item.comercializacion.toFixed(2))
	 	item.comercializacionLetra = NumeroALetras(item.comercializacion)}
	 	item.comercializacion = formatCurrency(item.comercializacion)
	    
	 	if (item.desempenioExtemporaneo) {
	 	item.desempenioExtemporaneo = parseFloat(item.desempenioExtemporaneo.toFixed(2))
	 	item.desempenioLetra = NumeroALetras(item.desempenioExtemporaneo)}
	 	item.desempenioExtemporaneo = formatCurrency(item.desempenioExtemporaneo)
	 	if (item.reposicionContrato) {
	 	item.reposicionContrato = parseFloat(item.reposicionContrato.toFixed(2))
	 	item.reposicionLetra = NumeroALetras(item.reposicionContrato)}
	 	item.reposicionContrato = formatCurrency(item.reposicionContrato)
	 });
	  
	  contrato.fechaEntrega =moment(contrato.fechaEntrega).format("DD-MM-YYYY")
	  var vigencia = planPagos[planPagos.length - 1];
	  var vigenciaFecha = vigencia.fechaLimite;
	
	  var fecha = new Date();

  	function formatDate(date) {
	  	  date = new Date(date);
			  var monthNames = [
			    "ENERO", "FEBRERO", "MARZO",
			    "ABRIL", "MAYO", "JUNIO", "JULIO",
			    "AGOSTO", "SEPTIEMBRE", "OCTUBRE",
			    "NOVIEMBRE", "DICIEMBRE"
			  ];
			  var day = date.getDate();
			  var monthIndex = date.getMonth();
			  var year = date.getFullYear();
		
			  return day + ' ' + 'DE' + ' '  + monthNames[monthIndex] + ' ' + ' DEL'  + ' ' + year;
		}
		function formatDia(date) {
  	    	date = new Date(date);
		  var monthNames = [
		    "ENERO", "FEBRERO", "MARZO",
		    "ABRIL", "MAYO", "JUNIO", "JULIO",
		    "AGOSTO", "SEPTIEMBRE", "OCTUBRE",
		    "NOVIEMBRE", "DICIEMBRE"
		  ];
		  //console.log(date,"date")
		  var day = date.getDate();
		  //console.log(day,"DIA")
		  var monthIndex = date.getMonth();
		  var year = date.getFullYear();
	
		  return day + ' ' + 'DE' + ' '  + monthNames[monthIndex] + ' ' + ' DEL'  + ' ' + year;
		}
		function formatDa(date) {
  	    	date = new Date(date);
		  var monthNames = [
		    "ENERO", "FEBRERO", "MARZO",
		    "ABRIL", "MAYO", "JUNIO", "JULIO",
		    "AGOSTO", "SEPTIEMBRE", "OCTUBRE",
		    "NOVIEMBRE", "DICIEMBRE"
		  ];
		  //console.log(date,"date")
		  var day = date.getDate();
		  //console.log(day,"DIA")
		  var monthIndex = date.getMonth();
		  var year = date.getFullYear();
	
		  return day + ' ' + 'DE' + ' '  + monthNames[monthIndex] + ' ' + ' DEL'  + ' ' + year;
		}

    var fechaVigencia = formatDate(vigenciaFecha);
    contrato.capitalSolicitado = formatCurrency(contrato.capitalSolicitado);
    contrato.adeudoInicial = formatCurrency(contrato.adeudoInicial);
		
		contrato.centavosSeg = "00";
		if (contrato.seguro){
				
				var valoresSeg = (contrato.seguro).toString().split('.');
				contrato.centavosSeg = valoresSeg[1];
				contrato.seguroLetra = NumeroALetras(valoresSeg[0])
						
		}
		
		var valoresCS = (contrato.capitalSolicitado).toString().split('.');
		var centavosCS = valoresCS[1];
		var letra = NumeroALetras(valoresCS[0].replace(',',''));
		
		contrato.centavosCS = centavosCS;
		
		var valoresAI = (contrato.adeudoInicial).toString().split('.');
		var centavosAI = valoresAI[1];
		var letraAI = NumeroALetras(valoresAI[0].replace(',',''));
		
		var tasaPor = NumeroALetras(contrato.tasa);
   
    var fechaLetra = formatDia(fecha);

    var autorizacionProveedorSi = contrato.avisoPrivacidad;
    var autorizacionProveedorNo = "";
    if (autorizacionProveedorSi == 0) {
    	autorizacionProveedorSi = "X"
    }else{
    	autorizacionProveedorNo = "X"
    }
    var autorizacionPublicidadSi = contrato.publicidad;
    var autorizacionPublicidadNo = "";
    if (autorizacionPublicidadSi == "0") {
    	autorizacionPublicidadSi = "X"
    }else{
    	autorizacionPublicidadNo = "X"
    }
    //console.log(autorizacionProveedorSi,"contrato")
    function sumarDias(fecha){
			fecha.setDate(fecha.getDate() + 1);
			return fecha;
		}
		var fechaFiniquitoVigencia = sumarDias(vigencia.fechaLimite)
		//console.log(fechaFiniquitoVigencia,"nandaaa")
		var vigenciaMasUnDia = formatDate(vigenciaFecha);
		  

		var diaV = vigencia.fechaLimite.getDate()
    var mesV = vigencia.fechaLimite.getMonth()+1
    var anioV = vigencia.fechaLimite.getFullYear()
    if (Number(diaV) < 10) {
    	diaV = "0" + diaV;
    }
    if (Number(mesV) < 10) {
    	mesV = "0" + mesV;
    }
    vigencia.fechaLimite = diaV+ "-" + mesV + "-" + anioV
  		
  	if (_.isEmpty(contrato.garantias) && _.isEmpty(contrato.avales_ids)) 
  	{
				var fs = require('fs');
		    	var Docxtemplater = require('docxtemplater');
				var JSZip = require('jszip');
				var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
				
				////////////////////////////////////////////
				//var produccion = "/home/cremio/archivos/";
				//var produccion = meteor_root+"/web.browser/app/plantillas/";
						
				if (contrato.tipoInteres.tipoInteres == "Simple") {
					var content = fs
					.readFileSync(produccion+"CONTRATOINTERES.docx", "binary");
				}
				if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
					var content = fs
					.readFileSync(produccion+"CONTRATOINTERESSSI.docx", "binary");
				}
				if (contrato.tipoInteres.tipoInteres == "Compuesto") {
					var content = fs
					.readFileSync(produccion+"CONTRATOINTERESCOMPUESTO.docx", "binary");
				}
							
				var zip = new JSZip(content);
				var doc=new Docxtemplater()
										.loadZip(zip).setOptions({nullGetter: function(part) {
					if (!part.module) {
					}
					if (part.module === "rawxml") {
					return "";
					}
					return "";
				}});
		
				doc.setData({ items: 	   contrato,
											fecha:     fechaLetra,
											cliente: cliente,
											contrato: contrato,
											pp: planPagos,
											letra : letra,
											letraAI: letraAI,
											centavosAI: centavosAI,
											aval: avales,
											tasaPor : tasaPor,
											vigencia : fechaVigencia,
											vigenciaMasUnDia : vigenciaMasUnDia,
											autorizacionProveedorSi : autorizacionProveedorSi,
											autorizacionProveedorNo : autorizacionProveedorNo,
											autorizacionPublicidadSi : autorizacionPublicidadSi,
											autorizacionPublicidadNo : autorizacionPublicidadNo,
													
				});
				doc.render();
		 
				var buf = doc.getZip()
		             		 .generate({type:"nodebuffer"});
					
		 		 if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
		     		 	fs.writeFileSync(produccionSalida+"CONTRATOINTERESSalidaSSISalida.docx",buf);
		     		 	 var bitmap = fs.readFileSync(produccionSalida+"CONTRATOINTERESSalidaSSISalida.docx");
		     		 }
		     		 if (contrato.tipoInteres.tipoInteres == "Simple") {
		     		 	fs.writeFileSync(produccionSalida+"CONTRATOINTERESSalida.docx",buf);
		     		 	 var bitmap = fs.readFileSync(produccionSalida+"CONTRATOINTERESSalida.docx");
		     		 }
		     		 if (contrato.tipoInteres.tipoInteres == "Compuesto") {
		     		 	fs.writeFileSync(produccionSalida+"CONTRATOINTERESSalidaCOMPUESTOSalida.docx",buf);
		     		 	 var bitmap = fs.readFileSync(produccionSalida+"CONTRATOINTERESSalidaCOMPUESTOSalida.docx");
		     		 }		
		
		    
		    // convert binary data to base64 encoded string
		    return new Buffer(bitmap).toString('base64');
		
   }
   	if (contrato.avales_ids && _.isEmpty(contrato.garantias)) 
   	{
		   	//console.log(contrato,"contratos con aval sin garantias ")
				var fs = require('fs');
		    	var Docxtemplater = require('docxtemplater');
				var JSZip = require('jszip');
				var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
			   
			  //////////////////////////////
			  //var produccion = "/home/cremio/archivos/";
				// var produccion = meteor_root+"/web.browser/app/plantillas/";
		
			  if (contrato.tipoInteres.tipoInteres == "Simple") {
					var content = fs
							.readFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIO.docx", "binary");
				}
				if (contrato.tipoInteres.tipoInteres == "Compuesto") {
					var content = fs
							.readFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIOCOMPUESTO.docx", "binary");
				}
				if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
					var content = fs
							.readFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIOSSI.docx", "binary");
				}
		    	   
				var zip = new JSZip(content);
				var doc=new Docxtemplater()
										.loadZip(zip).setOptions({nullGetter: function(part) {
					if (!part.module) {
					}
					if (part.module === "rawxml") {
					return "";
					}
					return "";
				}});
				
			    
			  		doc.setData({				items: 		 contrato,
											    fecha:     fechaLetra,
											    cliente:    cliente,
											    pp: planPagos,
											    contrato: contrato,
											    letra : letra,
											    letraAI: letraAI,
													centavosAI: centavosAI,
											    aval: avales,
											    tasaPor : tasaPor,
											    vigencia : fechaVigencia,
											    vigenciaMasUnDia : vigenciaMasUnDia,
											    autorizacionProveedorSi : autorizacionProveedorSi,
											    autorizacionProveedorNo : autorizacionProveedorNo,
											    autorizacionPublicidadSi : autorizacionPublicidadSi,
											    autorizacionPublicidadNo : autorizacionPublicidadNo,
		
						});
										
				doc.render();
		 
				var buf = doc.getZip()
		             		 .generate({type:"nodebuffer"});
		 	           		 if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
		             		 	fs.writeFileSync(produccionSalida+"CONTRATOOBLIGADOSOLIDARIOSalidaSSISalida.docx",buf);
		             		 	 var bitmap = fs.readFileSync(produccionSalida+"CONTRATOOBLIGADOSOLIDARIOSalidaSSISalida.docx");
		             		 }
		             		 if (contrato.tipoInteres.tipoInteres == "Simple") {
		             		 	fs.writeFileSync(produccionSalida+"CONTRATOOBLIGADOSOLIDARIOSalida.docx",buf);
		             		 	 var bitmap = fs.readFileSync(produccionSalida+"CONTRATOOBLIGADOSOLIDARIOSalida.docx");
		             		 }
		             		 if (contrato.tipoInteres.tipoInteres == "Compuesto") {
		             		 	fs.writeFileSync(produccionSalida+"CONTRATOOBLIGADOSOLIDARIOSalidaCOMPUESTOSalida.docx",buf);
		             		 	 var bitmap = fs.readFileSync(produccionSalida+"CONTRATOOBLIGADOSOLIDARIOSalidaCOMPUESTOSalida.docx");
		             		 }	
						
		    // convert binary data to base64 encoded string
		    return new Buffer(bitmap).toString('base64');
   }
	 	if (contrato.garantias && contrato.tipoGarantia == "general") 
	 	{

				var fs = require('fs');
		    	var Docxtemplater = require('docxtemplater');
				var JSZip = require('jszip');
				var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
				
				if (contrato.tipoInteres.tipoInteres == "Simple") {
					var content = fs
							.readFileSync(produccion+"CONTRATOHIPOTECARIO.docx", "binary");
				}
				if (contrato.tipoInteres.tipoInteres == "Compuesto") {
					var content = fs
							.readFileSync(produccion+"CONTRATOHIPOTECARIOCOMPUESTO.docx", "binary");
				}
				if (contrato.tipoInteres.tipoInteres == "saldos Insolutos") {
					var content = fs
							.readFileSync(produccion+"CONTRATOHIPOTECARIOSSI.docx", "binary");
				}
						
		    	   
				var zip = new JSZip(content);
				var doc=new Docxtemplater()
										.loadZip(zip).setOptions({nullGetter: function(part) {
					if (!part.module) {
					}
					if (part.module === "rawxml") {
					return "";
					}
					return "";
				}});
				
			  		doc.setData({		    items: 	   contrato,
											fecha:     fechaLetra,
											cliente: cliente,
											contrato: contrato,
											pp: planPagos,
											letra : letra,
											letraAI: letraAI,
											centavosAI: centavosAI,
											aval: avales,
											tasaPor : tasaPor,
											vigencia : fechaVigencia,
											vigenciaMasUnDia : vigenciaMasUnDia,
											autorizacionProveedorSi : autorizacionProveedorSi,
											autorizacionProveedorNo : autorizacionProveedorNo,
											autorizacionPublicidadSi : autorizacionPublicidadSi,
											autorizacionPublicidadNo : autorizacionPublicidadNo,
															
						});
										
				doc.render();
		 
					
						var buf = doc.getZip()
		             		 .generate({type:"nodebuffer"});
		             		 if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
		             		 	//console.log(",cjecj")
		             		 	fs.writeFileSync(produccionSalida+"CONTRATOHIPOTECARIOSalidaSSISalida.docx",buf);
		             		 	 var bitmap = fs.readFileSync(produccionSalida+"CONTRATOHIPOTECARIOSalidaSSISalida.docx");
		             		 }
		             		 if (contrato.tipoInteres.tipoInteres == "Simple") {
		             		 	fs.writeFileSync(produccionSalida+"CONTRATOHIPOTECARIOSalida.docx",buf);
		             		 	 var bitmap = fs.readFileSync(produccionSalida+"CONTRATOHIPOTECARIOSalida.docx");
		             		 }
		             		 if (contrato.tipoInteres.tipoInteres == "Compuesto") {
		             		 	fs.writeFileSync(produccionSalida+"CONTRATOHIPOTECARIOSalidaCOMPUESTOSalida.docx",buf);
		             		 	 var bitmap = fs.readFileSync(produccionSalida+"CONTRATOHIPOTECARIOSalidaCOMPUESTOSalida.docx");
		             		 }
						    
		  
		    // convert binary data to base64 encoded string
		    return new Buffer(bitmap).toString('base64');

   }
	 	if (contrato.garantias && contrato.tipoGarantia == "mobiliaria") 
	 	{

				var fs = require('fs');
		    	var Docxtemplater = require('docxtemplater');
				var JSZip = require('jszip');
				var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
				
				if (contrato.tipoInteres.tipoInteres == "Simple") {
					//console.log("entra SIMPLE")
					var content = fs				
							.readFileSync(produccion+"CONTRATOGARANTIAPRENDARIA.docx", "binary");
				}
				if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
					//console.log("entra saldos")
					var content = fs				
							.readFileSync(produccion+"CONTRATOGARANTIAPRENDARIASSI.docx", "binary");
				}
				if (contrato.tipoInteres.tipoInteres == "Compuesto") {
					//console.log("entra COMPUESTO")
					var content = fs				
							.readFileSync(produccion+"CONTRATOGARANTIAPRENDARIACOMPUESTO.docx", "binary");
				}
		    	   
				var zip = new JSZip(content);
				var doc=new Docxtemplater()
										.loadZip(zip).setOptions({nullGetter: function(part) {
					if (!part.module) {
					}
					if (part.module === "rawxml") {
					return "";
					}
					return "";
				}});
				
			    
	  		doc.setData({	items										: contrato,
									    fecha:     fechaLetra,
									    cliente:   cliente,
											contrato: contrato,
											pp: planPagos,
											letra : letra,
											letraAI: letraAI,
											centavosAI: centavosAI,
											aval : avales,
											tasaPor : tasaPor,
											vigencia : fechaVigencia,
											vigenciaMasUnDia : vigenciaMasUnDia,
											autorizacionProveedorSi : autorizacionProveedorSi,
											autorizacionProveedorNo : autorizacionProveedorNo,
											autorizacionPublicidadSi : autorizacionPublicidadSi,
											autorizacionPublicidadNo : autorizacionPublicidadNo,
										//garantias: 
				});
										
				doc.render();
		 
				var buf = doc.getZip()
		             		 .generate({type:"nodebuffer"});
		             		 if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
		             		 	//console.log(",monndddrigoo")
		             		 	fs.writeFileSync(produccionSalida+"CONTRATOGARANTIAPRENDARIASSISalida.docx",buf);
		             		 	 var bitmap = fs.readFileSync(produccionSalida+"CONTRATOGARANTIAPRENDARIASSISalida.docx");
		             		 }
		             		 if (contrato.tipoInteres.tipoInteres == "Simple") {
		             		 	fs.writeFileSync(produccionSalida+"CONTRATOGARANTIAPRENDARIASalida.docx",buf);
		             		 	 var bitmap = fs.readFileSync(produccionSalida+"CONTRATOGARANTIAPRENDARIASalida.docx");
		             		 }
		             		 if (contrato.tipoInteres.tipoInteres == "Compuesto") {
		             		 	fs.writeFileSync(produccionSalida+"CONTRATOGARANTIAPRENDARIACOMPUESTOSalida.docx",buf);
		             		 	 var bitmap = fs.readFileSync(produccionSalida+"CONTRATOGARANTIAPRENDARIACOMPUESTOSalida.docx");
		             		 }
						
		
		    //var bitmap = fs.readFileSync(produccion+"CONTRATOGARANTIAPRENDARIASalida.docx");
		    
		    return new Buffer(bitmap).toString('base64');

   }
},
  contratoDistribuidor: function (distribuidor_id) {
	  
	  if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }

    function Unidades(num){

		        switch(num)
		        {
		            case 1: return 'UN';
		            case 2: return 'DOS';
		            case 3: return 'TRES';
		            case 4: return 'CUATRO';
		            case 5: return 'CINCO';
		            case 6: return 'SEIS';
		            case 7: return 'SIETE';
		            case 8: return 'OCHO';
		            case 9: return 'NUEVE';
		        }
		
		        return '';
		    
    }//Unidades()
		function Decenas(num){
		
		        let decena = Math.floor(num/10);
		        let unidad = num - (decena * 10);
		
		        switch(decena)
		        {
		            case 1:
		                switch(unidad)
		                {
		                    case 0: return 'DIEZ';
		                    case 1: return 'ONCE';
		                    case 2: return 'DOCE';
		                    case 3: return 'TRECE';
		                    case 4: return 'CATORCE';
		                    case 5: return 'QUINCE';
		                    default: return 'DIECI' + Unidades(unidad);
		                }
		            case 2:
		                switch(unidad)
		                {
		                    case 0: return 'VEINTE';
		                    default: return 'VEINTI' + Unidades(unidad);
		                }
		            case 3: return DecenasY('TREINTA', unidad);
		            case 4: return DecenasY('CUARENTA', unidad);
		            case 5: return DecenasY('CINCUENTA', unidad);
		            case 6: return DecenasY('SESENTA', unidad);
		            case 7: return DecenasY('SETENTA', unidad);
		            case 8: return DecenasY('OCHENTA', unidad);
		            case 9: return DecenasY('NOVENTA', unidad);
		            case 0: return Unidades(unidad);
		        }
		    }//Unidades()
    function DecenasY(strSin, numUnidades) {
        if (numUnidades > 0)
            return strSin + ' Y ' + Unidades(numUnidades)

        return strSin;
    }//DecenasY()
    function Centenas(num) {
		        let centenas = Math.floor(num / 100);
		        let decenas = num - (centenas * 100);
		
		        switch(centenas)
		        {
		            case 1:
		                if (decenas > 0)
		                    return 'CIENTO ' + Decenas(decenas);
		                return 'CIEN';
		            case 2: return 'DOSCIENTOS ' + Decenas(decenas);
		            case 3: return 'TRESCIENTOS ' + Decenas(decenas);
		            case 4: return 'CUATROCIENTOS ' + Decenas(decenas);
		            case 5: return 'QUINIENTOS ' + Decenas(decenas);
		            case 6: return 'SEISCIENTOS ' + Decenas(decenas);
		            case 7: return 'SETECIENTOS ' + Decenas(decenas);
		            case 8: return 'OCHOCIENTOS ' + Decenas(decenas);
		            case 9: return 'NOVECIENTOS ' + Decenas(decenas);
		        }
		
		        return Decenas(decenas);
		    }//Centenas()
    function Seccion(num, divisor, strSingular, strPlural) {
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let letras = '';

        if (cientos > 0)
            if (cientos > 1)
                letras = Centenas(cientos) + ' ' + strPlural;
            else
                letras = strSingular;

        if (resto > 0)
            letras += '';

        return letras;
    }//Seccion()
    function Miles(num) {
        let divisor = 1000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMiles = Seccion(num, divisor, 'UN MIL', 'MIL');
        let strCentenas = Centenas(resto);

        if(strMiles == '')
            return strCentenas;

        return strMiles + ' ' + strCentenas;
    }//Miles()
    function Millones(num) {
        let divisor = 1000000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMillones = Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
        let strMiles = Miles(resto);

        if(strMillones == '')
            return strMiles;

        return strMillones + ' ' + strMiles;
    }//Millones()
		function NumeroALetras(num, currency) {
        currency = currency || {};
        let data = {
            numero: num,
            enteros: Math.floor(num),
            centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
            letrasCentavos: '',
            letrasMonedaPlural: currency.plural || '',//'PESOS', 'Dólares', 'Bolívares', 'etcs'
            letrasMonedaSingular: currency.singular || '', //'PESO', 'Dólar', 'Bolivar', 'etc'
            letrasMonedaCentavoPlural: currency.centPlural || '',
            letrasMonedaCentavoSingular: currency.centSingular || ''

        };

        if (data.centavos > 0) {
            data.letrasCentavos = 'CON ' + (function () {
                    if (data.centavos == 1)
                        return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoSingular;
                    else
                        return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoPlural;
                })();
        };

        if(data.enteros == 0)
            return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
        if (data.enteros == 1)
            return Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' ' + data.letrasCentavos;
        else
            return Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
    };	
		function formatDate(date) {
	  	  date = new Date(date);
			  var monthNames = [
			    "ENERO", "FEBRERO", "MARZO",
			    "ABRIL", "MAYO", "JUNIO", "JULIO",
			    "AGOSTO", "SEPTIEMBRE", "OCTUBRE",
			    "NOVIEMBRE", "DICIEMBRE"
			  ];
			  var day = date.getDate();
			  var monthIndex = date.getMonth();
			  var year = date.getFullYear();
		
			  return day + ' ' + 'DE' + ' '  + monthNames[monthIndex] + ' ' + ' DEL'  + ' ' + year;
		}
		function formatDia(date) {
  	    	date = new Date(date);
		  var monthNames = [
		    "ENERO", "FEBRERO", "MARZO",
		    "ABRIL", "MAYO", "JUNIO", "JULIO",
		    "AGOSTO", "SEPTIEMBRE", "OCTUBRE",
		    "NOVIEMBRE", "DICIEMBRE"
		  ];
		  //console.log(date,"date")
		  var day = date.getDate();
		  //console.log(day,"DIA")
		  var monthIndex = date.getMonth();
		  var year = date.getFullYear();
	
		  return day + ' ' + 'DE' + ' '  + monthNames[monthIndex] + ' ' + ' DEL'  + ' ' + year;
		}
		function formatDa(date) {
  	    	date = new Date(date);
		  var monthNames = [
		    "ENERO", "FEBRERO", "MARZO",
		    "ABRIL", "MAYO", "JUNIO", "JULIO",
		    "AGOSTO", "SEPTIEMBRE", "OCTUBRE",
		    "NOVIEMBRE", "DICIEMBRE"
		  ];
		  //console.log(date,"date")
		  var day = date.getDate();
		  //console.log(day,"DIA")
		  var monthIndex = date.getMonth();
		  var year = date.getFullYear();
	
		  return day + ' ' + 'DE' + ' '  + monthNames[monthIndex] + ' ' + ' DEL'  + ' ' + year;
		}
		
		
		const formatCurrency = require('format-currency');
		
			
/*
		if (avales == undefined) {
			avales = cliente
		}
		
		if (contrato.periodoPago == "Semanal") {
			contrato.periodoPago = "SEMANAL"
		}
		if (contrato.periodoPago == "Quincenal") {
			contrato.periodoPago = "QUINCENAL"
		}
		if (contrato.periodoPago == "Mensual") {
			contrato.periodoPago = "MENSUAL"
		}

		if (contrato.seguro == undefined) {
			contrato.seguro = 0
		}
*/
		
		//Distribuidor***********************************************************
		var cliente = {};
		var user = Meteor.users.findOne(distribuidor_id);
		cliente.nombreCompleto = user.profile.nombreCompleto;
		var nacionalidad = Nacionalidades.findOne(user.profile.nacionalidad_id);
  	cliente.nacionalidad = nacionalidad.nombre;
  	var colonia = Colonias.findOne(user.profile.colonia_id);
  	cliente.colonia = colonia.nombre;
  	cliente.calle = user.profile.calle;
  	cliente.numero = user.profile.numero;
  	cliente.codigoPostal = user.profile.codigoPostal;
  	var ciudad = Ciudades.findOne(user.profile.ciudad_id);
  	cliente.ciudad = ciudad.nombre;  	
  	var estado = Estados.findOne(user.profile.estado_id);
  	cliente.estado = estado.nombre;
  	cliente.celular = user.profile.celular;
  	cliente.rfc = user.profile.rfc;
		cliente.correo = user.profile.correo;
  	cliente.numeroDistribuidor = user.profile.numeroDistribuidor;
  	//Distribuidor***********************************************************
  	
  	//Aval*******************************************************************
  	var aval = {};
  	
  	var avalTemp = Avales.findOne({_id: user.profile.avales_ids[0]._id});
  	aval.nombreCompleto = avalTemp.profile.nombreCompleto;
		nacionalidad = Nacionalidades.findOne(avalTemp.profile.nacionalidad_id);
  	aval.nacionalidad = nacionalidad.nombre
  	colonia = Colonias.findOne(avalTemp.profile.colonia_id);
  	aval.colonia = colonia.nombre;
  	aval.calle = avalTemp.profile.calle;
  	aval.numero = avalTemp.profile.numero;
  	aval.codigoPostal = avalTemp.profile.codigoPostal;
  	ciudad = Ciudades.findOne(avalTemp.profile.ciudad_id);
  	aval.ciudad = ciudad.nombre;  	
  	estado = Estados.findOne(avalTemp.profile.estado_id);
  	aval.estado = estado.nombre;
  	aval.celular = avalTemp.profile.celular;
  	aval.rfc = avalTemp.profile.rfc;
		aval.correo = avalTemp.profile.correo;
  	//Aval*******************************************************************
  	
  	var montoCredito = formatCurrency(user.profile.limiteCredito);
  	
  	var valoresCS = (montoCredito).toString().split('.');
		var centavosCS = valoresCS[1];
		var letra = NumeroALetras(valoresCS[0].replace(',',''));
  	var fecha = new Date();
		var fechaLetra = formatDia(fecha);
  	
		var year = fecha.getFullYear();
		var month = fecha.getMonth();
		var day = fecha.getDate();
		var vigencia = new Date(year + 1, month, day)
 	
  	var fechaVigencia = formatDia(vigencia);


/*
    var autorizacionProveedorSi = contrato.avisoPrivacidad;
    var autorizacionProveedorNo = "";
    if (autorizacionProveedorSi == 0) {
    	autorizacionProveedorSi = "X"
    }else{
    	autorizacionProveedorNo = "X"
    }
    var autorizacionPublicidadSi = contrato.publicidad;
    var autorizacionPublicidadNo = "";
    if (autorizacionPublicidadSi == "0") {
    	autorizacionPublicidadSi = "X"
    }else{
    	autorizacionPublicidadNo = "X"
    }
    //console.log(autorizacionProveedorSi,"contrato")
    function sumarDias(fecha){
			fecha.setDate(fecha.getDate() + 1);
			return fecha;
		}
		var fechaFiniquitoVigencia = sumarDias(vigencia.fechaLimite)

		var vigenciaMasUnDia = formatDate(vigenciaFecha);
		  

		var diaV = vigencia.fechaLimite.getDate()
    var mesV = vigencia.fechaLimite.getMonth()+1
    var anioV = vigencia.fechaLimite.getFullYear()
    if (Number(diaV) < 10) {
    	diaV = "0" + diaV;
    }
    if (Number(mesV) < 10) {
    	mesV = "0" + mesV;
    }
    vigencia.fechaLimite = diaV+ "-" + mesV + "-" + anioV
*/
  		
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		//var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		var content = fs
		.readFileSync(produccion+"CONTRATODISTRIBUIDOR.docx", "binary");
					
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});

		doc.setData({ fecha											: fechaLetra,
									cliente										: cliente,
									letra 										: letra,
									montoCredito							: montoCredito,
									centavosCS								: centavosCS,
									aval											: aval,
									vigencia 									: fechaVigencia//,
/*
									autorizacionProveedorSi 	: autorizacionProveedorSi,
									autorizacionProveedorNo 	: autorizacionProveedorNo,
									autorizacionPublicidadSi 	: autorizacionPublicidadSi,
									autorizacionPublicidadNo 	: autorizacionPublicidadNo,
*/
											
		});
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
			
	 	fs.writeFileSync(produccionSalida+"CONTRATODISTRIBUIDORSalida.docx",buf);
	 	var bitmap = fs.readFileSync(produccionSalida+"CONTRATODISTRIBUIDORSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
   },
	getListaCobranza: function (objeto,tipo) {
			
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		var unoconv = require('better-unoconv');
    var future = require('fibers/future');
		
		var templateType = (tipo === 'pdf') ? '.docx' : (tipo === 'excel' ? '.xlsx' : '.docx');
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
		
		var content = fs
    	   .readFileSync(produccion+"LISTACOBRANZA.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		

		var fecha = new Date();
		var dia = fecha.getDate()
    var mes = fecha.getMonth()+1
    var anio = fecha.getFullYear()
    if (Number(dia) < 10) {
    	dia = "0" + dia;
    }
    if (Number(mes) < 10) {
    	mes = "0" + mes;
    }
    fecha = dia+ "-" + mes + "-" + anio;
	    
		_.each(objeto,function(item){
	      item.fechaLimite =moment(item.fechaLimite).format("DD-MM-YYYY")
	     
		});
		
		/*
objeto.sort(function(a, b){
		    var keyAF = Number(a.folio),
		        keyBF = Number(b.folio),
		        keyANP = Number(a.numeroPago),
		        keyBNP = Number(b.numeroPago);
		        
		    // Compare the 2 dates
		    if(keyAF < keyBF && keyANP > keyBNP) return -1;
		    if(keyAF > keyBF && keyANP < keyBNP) return 1;
		    return 0;
		});
		
		console.log(objeto);
*/
		
		
		doc.setData({	items: 	objeto,
									fecha:  fecha,
		});
		
		var res = new future();							
		doc.render();
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		/*
fs.writeFileSync(produccionSalida+"LISTACOBRANZASalida.docx",buf);		
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"LISTACOBRANZASalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
*/
    
    
    var rutaOutput = (Meteor.isDevelopment ? publicPath + "public/generados/" : produccionSalida) + "LISTACOBRANZASalida" + objeto.nombreCompleto + templateType;
     
    fs.writeFileSync(rutaOutput, buf);
          		 
		unoconv.convert(rutaOutput, 'pdf', function(err, result) {
      if(!err){
        fs.unlink(rutaOutput);
        res['return']({ uri: 'data:application/pdf;base64,' + result.toString('base64'), nombre: "LISTACOBRANZASOUT" + '.pdf' });
      }else{
        res['return']({err: err});
        console.log("Error al convertir pdf:", err);
      }
    });
		
    return res.wait();
    
		
  }, 
	imprimirHistorial: function (objeto,cliente,credito,tipo) {
	
		
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var ImageModule = require('docxtemplater-image-module');
		
		var unoconv = require('better-unoconv');
    var future = require('fibers/future');
		
		var templateType = (tipo === 'pdf') ? '.docx' : (tipo === 'excel' ? '.xlsx' : '.docx');
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
		
		var opts = {}
			opts.centered = false;
			opts.getImage=function(tagValue, tagName) {
					var binaryData =  fs.readFileSync(tagValue,'binary');
					return binaryData;
		}
		
		opts.getSize=function(img,tagValue, tagName) {
		    return [180,160];
		}

		var imageModule=new ImageModule(opts);
				 
		var content = fs
    	   .readFileSync(produccion+"HISTORIALCREDITICIO.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
						.attachModule(imageModule)
						.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});

		const formatCurrency = require('format-currency')
		var pic = String(cliente.foto);
		cliente.foto = pic.replace('data:image/jpeg;base64,', '');
		var bitmap = new Buffer(cliente.foto, 'base64');
		fs.writeFileSync(produccion+".jpeg", bitmap);
		cliente.foto = produccion+".jpeg";
		
		var fecha = new Date();
		var f = fecha;
	    
       objeto.fechaLimite =moment(objeto.fechaLimite).format("DD-MM-YYYY")
       cliente.fechaCreacion =moment(cliente.fechaCreacion).format("DD-MM-YYYY")
       cliente.fechaNacimiento =moment(cliente.fechaNacimiento).format("DD-MM-YYYY")
       credito.fechaEntrega =moment(credito.fechaEntrega).format("DD-MM-YYYY")
       credito.adeudoInicial = parseFloat(credito.adeudoInicial.toFixed(2))
       credito.adeudoInicial = formatCurrency(credito.adeudoInicial)
       credito.saldoActual = parseFloat(credito.saldoActual.toFixed(2))
       credito.saldoActual = formatCurrency(credito.saldoActual)
       credito.saldoMultas = parseFloat(credito.saldoMultas.toFixed(2))
       credito.saldoMultas = formatCurrency(credito.saldoMultas)
       credito.capitalSolicitado = parseFloat(credito.capitalSolicitado.toFixed(2))
       credito.capitalSolicitado = formatCurrency(credito.capitalSolicitado)
       if (credito.numeroPagos < 10) {
	 	 		credito.numeroPagos = "0"+credito.numeroPagos
	 	 	}

      var totalCargos = 0;
      var totalAbonos = 0;
      
      //console.log(objeto)
      _.each(objeto,function(item){
		      item.fechaSolicito = moment(item.fechaSolicito).format("DD-MM-YYYY")
		      item.saldo = parseFloat(item.saldo.toFixed(2))
		      item.saldo = formatCurrency(item.saldo)
		      item.cargo = parseFloat(item.cargo.toFixed(2))
		      item.cargo = formatCurrency(item.cargo)
		      totalAbonos = parseFloat(item.sumaAbonos.toFixed(2))
		      totalAbonos = formatCurrency(totalAbonos)
		      totalCargos = parseFloat(item.sumaCargos.toFixed(2))
		      totalCargos = formatCurrency(totalCargos)
		      totalSaldo =  parseFloat(item.ultimoSaldo.toFixed(2))
		      totalSaldo = formatCurrency(totalSaldo)
		      
		      item.totalCargosMoratorios = parseFloat(item.sumaAbonosCM).toFixed(2);
		      totalCargosMoratorios = formatCurrency(item.totalCargosMoratorios )
					
					item.notaCredito = formatCurrency(item.notaCredito);
					
			});

	 		cliente.ciudad 				= cliente.ciudadCliente.nombre;
			cliente.sucursal 			= cliente.sucursales.nombreSucursal;
			cliente.colonia 			= cliente.coloniaCliente.nombre;
			cliente.municipio 		= cliente.municipioCliente.nombre;
			cliente.estado 				= cliente.estadoCliente.nombre;
			cliente.nacionalidad 	= cliente.nacionalidadCliente.nombre;
			cliente.estadoCivil 	= cliente.estadoCivilCliente.nombre;
			cliente.ocupacion 		= cliente.ocupacionCliente.nombre;
	    
	    // 	 if (item.folio < 10) {
	 	 	// 	item.folio = "0"+item.folio
	 	 	// }
	 	 	
	 		    
 		   var dia = fecha.getDate()
 		    var mes = fecha.getMonth()+1
 		    var anio = fecha.getFullYear()
 		    if (Number(dia) < 10) {
 		    	dia = "0" + dia;
 		    }
 		    if (Number(mes) < 10) {
 		    	mes = "0" + mes;
 		    }
 		    fecha = dia+ "-" + mes + "-" + anio
		
		doc.setData({				
						items									: objeto,
						sucursal							: cliente.sucursal,
						fechaCreacion					: cliente.fechaCreacion,
						nombreCompleto				: cliente.nombreCompleto,
						numeroCliente					: cliente.numeroCliente,
						sexo									: cliente.sexo,
						lugarNacimiento				: cliente.lugarNacimiento,
						nacionalidad					: cliente.nacionalidad,
						ocupacion							: cliente.ocupacion,
						fechaNacimiento				: cliente.fechaNacimiento,
						foto									: cliente.foto,
						credito								: credito,
						adeudoInicial 				: credito.adeudoInicial,
						fechaEmision					: fecha,
						saldoMultas 					: credito.saldoMultas,
						totalCargos 					: totalCargos,
						totalAbonos 					: totalAbonos,
						totalSaldo 						: totalSaldo,
						totalCargosMoratorios	: totalCargosMoratorios
				  });
		var res = new future();			
		doc.render();
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
    
    var rutaOutput = (Meteor.isDevelopment ? publicPath + "public/generados/" : produccionSalida) + "HISTORIALCREDITICIOSOUT" + objeto.nombreCompleto + templateType;
     
    fs.writeFileSync(rutaOutput, buf);
          		 
		unoconv.convert(rutaOutput, 'pdf', function(err, result) {
      if(!err){
        fs.unlink(rutaOutput);
        res['return']({ uri: 'data:application/pdf;base64,' + result.toString('base64'), nombre: "HISTORIALCREDITICIOOUT" + '.pdf' });
      }else{
        res['return']({err: err});
        console.log("Error al convertir pdf:", err);
      }
    });
		
    return res.wait();
		
		
  }, 
  formaSolicitud: function () {
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }

		
		//var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"FormatoSol.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
		var fecha = new Date();
		var f = fecha;
	    fecha = fecha.getDate()+'-'+(fecha.getMonth()+1)+'-'+fecha.getFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	   
			doc.setData({				

				  });
								
		doc.render();
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccionSalida+"FormatuSolSalida.docx",buf);		
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"FormatuSolSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  }, 
  imprimirImagenDocumento: function (imagen) {
	   
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var ImageModule = require('docxtemplater-image-module');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
		
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
		//var produccion = "/home/cremio/archivos/";

			var opts = {}
			opts.centered = false;
			opts.getImage=function(tagValue, tagName) {
					var binaryData =  fs.readFileSync(tagValue,'binary');
					return binaryData;
		}
		
		opts.getSize=function(img,tagValue, tagName) {
		    return [400,600];
		}
		
		var imageModule=new ImageModule(opts);

				 
				var content = fs
    	   .readFileSync(produccion+"imagenDocumento.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.attachModule(imageModule)
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
								//console.log(imagen,"IMAGEN MORRO")

								var f = String(imagen);
					//if (data:image/jpeg;base64) {}
					if (imagen.indexOf('jpeg') > -1){
						//console.log("entro con jpeg")
					imagen = f.replace('data:image/jpeg;base64,', '');
					var bitmap = new Buffer(imagen, 'base64');
					fs.writeFileSync(produccion+".jpeg", bitmap);
					imagen = produccion+".jpeg";

					}
					if (imagen.indexOf('png') > -1){
					//	console.log("entro con png")
					imagen = f.replace('data:image/png;base64,', '');
					var bitmap = new Buffer(imagen, 'base64');
					fs.writeFileSync(produccion+".png", bitmap);
					imagen = produccion+".png";
					}
					if (imagen.indexOf('jpg') > -1){
					//	console.log("entro con jpg")
					imagen = f.replace('data:image/jpg;base64,', '');
					var bitmap = new Buffer(imagen, 'base64');
					fs.writeFileSync(produccion+".jpg", bitmap);
					imagen = produccion+".jpg";
					}
								
		
		var fecha = new Date();
	  fecha = fecha.getDate()+'-'+(fecha.getMonth()+1)+'-'+fecha.getFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
		
		doc.setData({				imagen:    imagen,
									fecha:     fecha,
				  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccionSalida+"imagenDocumentoSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"imagenDocumentoSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
    
  report: function(params) {
    var Docxtemplater = require('docxtemplater');
    var JSZip = require('jszip');
    var unoconv = require('better-unoconv');
    var future = require('fibers/future');
    var fs = require('fs');
    var objParse = function(datos, obj, prof) {
      if (!obj) {
        obj = {};
      }
      _.each(datos, function(d, dd) {
        var i = prof ? prof + dd : dd;
        if (_.isDate(d)) {
          obj[i] = moment(d).format('DD-MM-YYYY');
        } else if (_.isArray(d)) {
          obj[i] = arrParse(d, []);
        } else if (_.isObject(d)) {
          objParse(d, obj, i + '.');
        } else {
          obj[i] = d;
        }
      });
      return obj
    };

    var arrParse = function(datos, arr) {
      _.each(datos, function(d) {
        if (_.isArray(d)){
          arr.push(arrParse(d, []));
        }else if (_.isObject(d)){
          var obj = objParse(d, {});
          arr.push(obj);
        } else {
          arr.push(!_.isDate(d) ? d : moment(d).format('DD-MM-YYYY'));
        }
      });
      return arr
    };

    params.datos = objParse(params.datos);
    params.datos.fechaReporte = moment().format('DD-MM-YYYY');  
    var templateType = (params.type === 'pdf') ? '.docx' : (params.type === 'excel' ? '.xlsx' : '.docx');
    if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var templateRoute = publicPath + "public/plantillas/" + params.templateNombre + templateType;
    }else{
      var publicPath = '/var/www/credmio/bundle/programs/web.browser/app/';
      var templateRoute = publicPath + "templates/" + params.templateNombre + templateType;
    }

    var content = fs.readFileSync(templateRoute, "binary");
    var res = new future();
    var zip = new JSZip(content);
    var doc = new Docxtemplater().loadZip(zip).setOptions({
      nullGetter: function(part) {
        if (!part.module) {
          return "";
        }
        if (part.module === "rawxml") {
          return "";
        }
        return "";
      }
    });

    doc.setData(params.datos);
    doc.render();
    var buf = doc.getZip().generate({ type: "nodebuffer" });
    if (params.type == 'pdf') {
      var rutaOutput = publicPath + (Meteor.isDevelopment ? ".outputs/" : "plantillas/") + params.reportNombre + moment().format('x') + templateType;
      fs.writeFileSync(rutaOutput, buf);
      unoconv.convert(rutaOutput, 'pdf', function(err, result) {
        if(!err){
          fs.unlink(rutaOutput);
          res['return']({ uri: 'data:application/pdf;base64,' + result.toString('base64'), nombre: params.reportNombre + '.pdf' });
        }else{
          res['return']({err: err});
        }
      });
    } else {
      var mime;
      if (templateType === '.xlsx') {
        mime = 'vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else {
        mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
      res['return']({ uri: 'data:application/' + mime + ';base64,' + buf.toString('base64'), nombre: params.reportNombre + templateType });
    }
    return res.wait()
  }
  
	
});