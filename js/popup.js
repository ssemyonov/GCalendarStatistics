var clientId = '820275896749-dmaqmts7k2japt0p7r8bqec14rblloep.apps.googleusercontent.com';
var apiKey = 'AIzaSyANRdsRMejvUiDAUB8zXPHx6VhoJK-QWgQ';
var scopes = 'https://www.googleapis.com/auth/calendar.readonly';

function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1);
  return new Date(d.setDate(diff));
}

function handleClientLoad() {
	console.log("Google API client loaded.");
	gapi.client.setApiKey(apiKey);
	gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, function(authResult) {
	  if (authResult && !authResult.error) {
		console.log("Google API authentication successful.");
		
		gapi.client.load('calendar', 'v3', function (){
			var html = '',
			request = gapi.client.calendar.calendarList.list({
					'fields': 'items(id,summary)'
				});
			request.execute(function (resp) {
				$.each(resp.items, function (i, v) {
				
					console.log(v);
				
					html += renderCalendar({ id: v.id, summary: v.summary});
					
					if (i < resp.items.length - 1)
						html += '<br/>';
					
				});
				$("#loadingPanel").hide();
				$("#calendarList").html(html);
				
			});
		});
	  } else {
		console.log(authResult);
	  }
	});
}

function renderCalendar(calendar) {
	var html = '';
	
	html += '<div data-calendar-id="' + calendar.id + '" class="panel panel-default panel-primary" style="margin-bottom: 0px">';
	html += '  <div class="panel-heading">' + calendar.summary + '</div>';
	html += '  <div class="panel-body">';
	html += '	<ul class="nav nav-pills">';
	html += '		<li><a href="#">Week <span class="badge week">?</span>&nbsp;<span class="label label-primary week">?</span></a></li>';
	html += '		<li><a href="#">Month <span class="badge month">?</span>&nbsp;<span class="label label-primary month">?</span></a></li>';
	html += '		<li><a href="#">Year <span class="badge year">?</span>&nbsp;<span class="label label-primary year">?</span></a></li>';
	html += '	</ul>';
	html += '  </div>';
	html += '</div>';
	
	loadStatistics(calendar.id, "week");
	loadStatistics(calendar.id, "month");
	loadStatistics(calendar.id, "year");
	
	return html;
}

function loadStatistics(calendarId, period) {

	var timeMin = new Date(new Date().getFullYear(), 0, 1);
	
	if (period === "month")
		timeMin = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
		
	if (period === "week")
		timeMin = getMonday(new Date());
	
	gapi.client.load('calendar', 'v3', function () {
		var request = gapi.client.calendar.events.list({
			'calendarId': calendarId,
			'timeMin': timeMin.toISOString(),
			'timeMax': new Date().toISOString()
		});

		request.execute(function (resp) {
			if (resp.items) {
				var totalHours = 0;
				$.each(resp.items, function (i, v) {
					var hours = Math.abs(new Date(v.end.dateTime) - new Date(v.start.dateTime)) / 36e5;
					totalHours += hours;
					console.log(calendarId + ": This " + period + " event '" + v.summary + "' took " + hours + " hour(s) at " + v.start.dateTime);
					
				});
				$( "div[data-calendar-id='" + calendarId + "'] > div > ul > li > a > span.badge." + period).html(resp.items.length);
				$( "div[data-calendar-id='" + calendarId + "'] > div > ul > li > a > span.label." + period).html(totalHours + "h");
			}
			else {
				$( "div[data-calendar-id='" + calendarId + "'] > div > ul > li > a > span.badge." + period).html(0);
				$( "div[data-calendar-id='" + calendarId + "'] > div > ul > li > a > span.label." + period).html("0h");
			}
		});
	});
}