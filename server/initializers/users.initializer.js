Meteor.startup(function () {
  if (Meteor.users.find().count() === 0) {
    Accounts.createUser({
      username: 'admin',
      password: '123qwe',
    });
    
    
  }
  /*	var multas = function () {
      console.log('multas!');
      Meteor.call("actualizarMultas");
    }

    var cron = new Meteor.Cron( {
      events:{
        "0 1 * * *"  : multas
      }
    });*/
});