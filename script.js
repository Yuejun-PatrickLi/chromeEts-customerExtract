var csrf_token = null;
var cookies = [];



function listCountry(){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://developer.linkedin.com/docs/reference/country-codes", false);
	xhr.setRequestHeader("csrf-token",csrf_token);
	xhr.send();
	var content = xhr.responseText;
	var table = content.match(/^<table> <tbody><tr><td>countryCode.+$/gm).join("");
	var line = table.match(/<td>(\w{2})<\/td> <td>(.{5,20})<\/td>/g); 
	var cl = [];
	for (var i = 0; i < line.length; i++) {
    	var m = line[i].match(/<td>(\w{2})<\/td> <td>(.{5,20})<\/td>/);
    	cl.push({code:m[1]+"%3A0",name:m[2]});
    }
	var html = [];
	for (var i = 0; i < cl.length; i++) {
		html.push('<span class="checkbox"><label><input type="checkbox" name="country" value="'+cl[i].code+'">'+cl[i].name+'</label></span>')
	}
	$("#countryPanel .panel-body").html(html.join(""))
	
} 

function listIndustry(){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://developer.linkedin.com/docs/reference/industry-codes", false);
	xhr.setRequestHeader("csrf-token", csrf_token);
    xhr.send();
    var content = xhr.responseText;
    var table = content.match(/^<table> <tbody><tr><td>Code.+$/gm).join("");
    var line = table.match(/<td>(\d{2})<\/td> <td>[^<]+<\/td> <td>([\w ]+)<\/td>/g)
    var il = []
    for (var i = 0; i < line.length; i++) {
    	var m = line[i].match(/<td>(\d{2})<\/td> <td>[^<]+<\/td> <td>([\w ]+)<\/td>/)
    	il.push({code:m[1],name:m[2]})
    }
	var html = []
	for (var i = 0; i < il.length; i++) {
		html.push('<span class="checkbox"><label><input type="checkbox" name="industry" value="'+il[i].code+'">'+il[i].name+'</label></span>')
	}
	$("#industryPanel .panel-body").html(html.join(""))
}

function search(){
	var cl = document.getElementsByName("country");
	var cc = [];
	for (var i = 0; i < cl.length; i++) {
   		if(cl[i].checked){
   			cc.push(cl[i].value);
   		}
   	}
	
	var il = document.getElementsByName("industry");
   	var ic = [];
   	for (var i = 0; i < il.length; i++) {
   		if(il[i].checked){
   			ic.push(il[i].value);
   		}
   	}
	
	var keywords = $('#keywordInput').val();
	
	var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.linkedin.com/voyager/api/search/cluster?count=10&guides=List(v-%3EPEOPLE,facetGeoRegion-%3E"+cc.join("%7C")+",facetIndustry-%3E"+ic.join("%7C")+")&keywords="+keywords+"&origin=FACETED_SEARCH&q=guided&start=0", false);
    xhr.setRequestHeader("csrf-token", csrf_token);
	xhr.send();
	
    var content = JSON.parse(xhr.responseText);
	
    var items = content.elements[0].elements;
    var html = ["<thead><tr><th>#</th><th>First Name</th><th>Last Name</th><th>Occupation</th></tr></thead>"];
    html.push("<tbody>");
    for (var i = 0; i < items.length; i++) {
        var p = items[i].hitInfo["com.linkedin.voyager.search.SearchProfile"].miniProfile;
        html.push("<tr><td>" + (i + 1) + "</td><td>" + p.firstName + "</td><td>" + p.lastName + "</td><td>" + p.occupation + "</td></tr>");
    }
    html.push("</tbody>");
    $("#resultsTable").html(html.join(""));
}

function init(){
	chrome.cookies.getAll({domain:"www.linkedin.com"},function(ck){
		for(var i=0;i<ck.length;i++){
			if(ck[i].name=="JSESSIONID"){
				csrf_token = JSON.parse(ck[i].value);
			}
			cookies.push(ck[i].name+"="+ck[i].value);
		}
		listCountry();
		listIndustry();
	})
	
}

document.addEventListener("DOMContentLoaded",function(){
	document.getElementById("searchBtn").addEventListener("click", search);
	init();
})