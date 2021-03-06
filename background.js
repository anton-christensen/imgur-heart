/*
The MIT License (MIT)
Copyright (c) <year> <copyright holders>
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
console.log('imgur heart is loading');

var options = {};
// default settings
options['taglinks'] 		= true;
options['greenheart'] 		= true;

// load user settings
chrome.storage.sync.get(options, function(data) {
	var keys = Object.keys(data);
	keys.forEach(function(elm, index) {
		options[elm] = data[elm];
	});

	
	// Apply changes
	if(options['taglinks'] == true) {	
		console.log("taglinks is on");
		setInterval(function() {
			generateTags();
		}, 500);
	}
	if(options['greenheart'] == true) {
		$('head').append('<link rel="stylesheet" href="'+chrome.extension.getURL('css/greenheart.css')+'" />');
	}
});

$(document).ready(function() {
	$(".stats-link").after('<div class="progress" style="display:inline-block; width:20%; height:20%; vertical-align:middle;"><div class="progress-bar progress-bar-success" role="progressbar"></div><div class="progress-bar progress-bar-danger" role="progressbar"></div></div>');
	var points = $(".progress");

	var button = $(".favorite-image");
	points.after('<div class="tag-holder"></div>');
	
});

function generateTags() {
  var tags = $("div.tag-list-results a");
  var holder = $(".tag-holder");
  holder.empty();
  tags.each(function(index) {
    if (index >= 2)
      return false;
    var tagName = $(this).text();
    holder.append('<br><a class="tag-link" href="/t/' + tagName + '">' + tagName + '</a>' + (tags.length === index + 1 ? '' : ''));
  });
}

function update() {
  changeBodyText();
}

function changeBodyText(color) {
  $('body').css('color', color);
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  changeBodyText(changes['text-color'].newValue);
});
chrome.storage.sync.get('text-color', function(obj) {
  changeBodyText(obj['text-color']);
});

var ups;
var downs;

function updateVoteBar() {
  window.setTimeout(function() {
    if (window.location.href.indexOf("https") > -1) {
      var imageID = window.location.href.replace("https://imgur.com/gallery/", "");
    } else {
      var imageID = window.location.href.replace("http://imgur.com/gallery/", "");
    }
    var apiUrl;

    if ($("title").html().indexOf("Album") > -1) {
      apiUrl = 'https://api.imgur.com/3/gallery/album/' + imageID + '/votes'
    } else {
      apiUrl = 'https://api.imgur.com/3/gallery/image/' + imageID + '/votes'
    }

    $.ajax({
      type: "GET",
      url: apiUrl,
      dataType: 'json',
      async: true,
      headers: {
        "Authorization": " Client-ID " + "d25fe2851fe0e96"
      },
      success: function(result) {

        ups = result.data.ups;
        downs = result.data.downs;

        percentUp = ((ups) / (ups + downs)) * 100;


        percentDown = ((downs) / (ups + downs)) * 100;



        $(".progress-bar-success").css("width", percentUp + "%");
        $(".progress-bar-danger").css("width", percentDown + "%");

      }
    });
  }, 50);
}
window.onload = function() {
  updateVoteBar();
}
$("#image").bind("DOMSubtreeModified", function() {
  updateVoteBar();
  generateTags();
});
