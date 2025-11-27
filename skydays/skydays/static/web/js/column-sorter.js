function cols() {

  var dataCols = $(".cols").attr("data-cols");
	var columns = parseInt(dataCols);
  
  if ($(window).width() <= 1000 & columns > 3) {
		var columns = 3
  }
  
  if ($(window).width() <= 550 & columns >= 2) {
    var columns = 1
  }
  
	var count = 0
	var content = $(".cols > *");
  
  $(".cols").before("<div class='cols-columns'></div>");

	content.each(function(index) {
		count = count + 1
		$(this).addClass("cols-sort-" + count + "")

		if (count == columns) {
			count = 0
		}
	});
  
  for(var i = 0 + 1; i < columns + 1 ; i++) {
    $(".cols-columns").append("<div class='cols-"+ i +"'></div>")
    $(".cols-sort-" + i).appendTo(".cols-" + i);
  }
}

cols();
