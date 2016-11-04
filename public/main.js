
function deleteRequest(name) {
	console.log('delete request function called with name: '+name)
	$.ajax({
		type :'DELETE',
		url:"/delete",
		data: {name:name},
		dataType:"text"})
	window.location.assign("http://localhost:3000/");
	console.log(window.location.assign("http://localhost:3000/"));
}


function updateRequest(personNumber,personName) {
	$.ajax({
		type :'POST',
		url:"/update",
		data: {name: personName,setName:$('input[name=name]').val() , setEmail: $('input[name=email]').val() , setAddress: $('input[name=address]').val() },
		dataType:"application/json"});
	console.log('ajax updaterequest called with: ' + personName);
	console.log('updaterequest using for newName: ' + $('input[name=name]').val() );
	window.location.assign("http://localhost:3000/display/"+personNumber);
}
