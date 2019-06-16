(function($){

	// calendar algorithm variables
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var day = ["S", "M", "T", "W", "T", "F", "S"];
    var dateToMonth = ["","January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var daysInGregorianMonths = [31,28,31,30,31,30,31,31,30,31,30,31];

	var defaults = {
        width : null,
        height : null,
        startDateRange : new Date("October 1, 2015 00:00:00"),
        endDateRange : new Date("December 31, 2018 00:00:00"),
		curDay : null,
		curMonth : null,
		curYear : null
    }

	var cal = {
		header : $('<div id="calHeader">'),
		monthDisp : $('<div id="calMonthDisp" class="h2">'),
		yearDisp : $('<div id="calYearDisp" class="h2">'),
		menuContainer : $('<div id="menuContainer">'),
		monthMenu : $('<div id="monthMenu" class="nav card">'),
		yearMenu : $('<div id="yearMenu" class="nav card">'),
		monthContainer : $('<div id="monthContainer">')
	}

	$.fn.nbmaacal = function(options) {

	    if (this.length === 0) {
	    	return this;
	    }

	    // support multiple elements
	    if (this.length > 1) {
	      this.each(function() {
	        $(this).nbmaacal(options);
	      });
	      return this;
	    }

	    var nbmaacal = {},
	    el = this;

	    // Return if obj is already initialized
	    if ($(el).data('nbmaacal')) { return; }


	    /**
	     * ===================================================================================
	     * = PRIVATE FUNCTIONS
	     * ===================================================================================
	     */

	    /**
	     * Initializes namespace settings to be used throughout plugin
	     */

		var init = function() {
			// Return if already initialized
			if ($(el).data('nbmaacal')) { return; }
			// merge user-supplied options with the defaults
			nbmaacal.settings = $.extend({}, defaults, options);
			// perform all DOM / CSS modifications
		    setup();
		}

		var setup = function() {
            nbmaacal.settings.width = el.width();
            nbmaacal.settings.height = nbmaacal.settings.width;
            nbmaacal.settings.startYear = nbmaacal.settings.startDateRange.getFullYear();
			nbmaacal.settings.endYear = nbmaacal.settings.endDateRange.getFullYear();
			nbmaacal.settings.curYear = null ? nbmaacal.settings.startYear : nbmaacal.settings.curYear;
			nbmaacal.settings.curMonth = null ?  nbmaacal.settings.startDateRange.getMonth() : nbmaacal.settings.curMonth;
            nbmaacal.settings.curDay = null ? nbmaacal.settings.curYear +'-' + nbmaacal.settings.curMonth + '-' + '01' : nbmaacal.settings.curDay;

			start();
		}

		var start = function() {

			buildFrame();
            buildCal();
			calControls();
            el.find('a').on('click',function(e){
                e.preventDefault;
            });
            calTrigger('calLoaded');
		}

        var calControls = function(){
			cal.monthMenu.children('a').on('click', function(e){
				e.preventDefault();
				nbmaacal.settings.curMonth = pad(this.dataset.value,2);
                nbmaacal.settings.curDay = nbmaacal.settings.curYear +'-' + nbmaacal.settings.curMonth + '-' + '01';
                cal.monthDisp.html(dateToMonth[parseInt(nbmaacal.settings.curMonth)]).attr('data-value',nbmaacal.settings.curMonth);
				buildCal();
                calTrigger('calChange');
			});
			cal.yearMenu.children('a').on('click', function(e){
				e.preventDefault();
				nbmaacal.settings.curYear = this.dataset.value;
                nbmaacal.settings.curDay = nbmaacal.settings.curYear +'-' + nbmaacal.settings.curMonth + '-' + '01';
				cal.yearDisp.html(nbmaacal.settings.curYear).attr('data-value', nbmaacal.settings.curYear);
				buildCal();
                calTrigger('calChange');
			});
			cal.monthContainer.on('click', '.calSquare', function(){
				nbmaacal.settings.curDay = this.dataset.value;
                calTrigger('calSquareClick');
			});
		}

        var calTrigger = function(triggerEventName){

            var firstOfMonth =  moment(nbmaacal.settings.curDay, "YYYY-MM-DD").startOf('month').format('YYYY-MM-DD');
            var endOfMonth =  moment(nbmaacal.settings.curDay, "YYYY-MM-DD").endOf('month').format('YYYY-MM-DD');

            el.attr({
                'data-cur-day-date' : nbmaacal.settings.curDay,
                'data-cur-week-date' : moment(nbmaacal.settings.curDay, "YYYY-MM-DD").startOf('week').format('YYYY-MM-DD'),
                'data-start-range' : moment(firstOfMonth, "YYYY-MM-DD").startOf('week').format('YYYY-MM-DD'),
                'data-end-range' : moment(endOfMonth, "YYYY-MM-DD").endOf('week').format('YYYY-MM-DD')
            });
            el.trigger(triggerEventName);
        }

		var buildFrame = function(){
            cal.monthDisp.html(dateToMonth[parseInt(nbmaacal.settings.curMonth)]);
            cal.yearDisp.html(nbmaacal.settings.curYear);
            cal.monthMenu.empty();
            cal.yearMenu.empty();
			for(var i=1;i<dateToMonth.length;i++){ var monthStr = dateToMonth[i]; cal.monthMenu.append('<a class="hovStyle" href="#" data-value="'+i+'"><small>'+monthStr.substring(0, 3)+'</small></a>'); }
			for(var year=nbmaacal.settings.startYear;year<=nbmaacal.settings.endYear;year++){ cal.yearMenu.append('<a class="hovStyle" href="#" data-value="'+year+'"><small>'+year+'</small></a>'); }
            cal.header.append(cal.monthDisp).append(cal.yearDisp);
            cal.menuContainer.append(cal.monthMenu).append(cal.yearMenu);
            el.append(cal.header).append(cal.menuContainer).append(cal.monthContainer);
		}

		var buildCal = function(){
			cal.monthContainer.empty();
			cal.monthContainer.append(buildCalGrid(nbmaacal.settings.curYear,nbmaacal.settings.curMonth));
			var calSquareH = $('.calSquare').height();
			$('.calSquare').css({'line-height':calSquareH +'px' });
			$('.weekday').css({'line-height':calSquareH +'px' });
            //wrap <span class="week">
            for(var i=0;i<$(".calSquare").length;i+=7){
				var dataVal = $(".calSquare").eq(i).attr('data-value');
				$(".calSquare").slice(i, i+7).wrapAll('<span class="week" data-value="'+dataVal+'">');
			}
		}

        var buildCalGrid = function(y,m) {

			m = parseInt(m);
			y =  parseInt(y);
            var dayOfWeekInt = (dayOfWeek(y,m,1) | 0);  // simply or 0 the float to truncate to integer
			var lastDayofWeekInt = (dayOfWeek(y,m,daysInGregorianMonths[m-1]) | 0);
            if(y==2017){ dayOfWeekInt=dayOfWeekInt+1; }
            var calGrid = $('<div class="calGrid">').css('height', nbmaacal.settings.height);;
			var daysContainer = $('<div class="daysContainer">').css({'width':'100%','height':'100%'});
            var monthClear = $('<div class="clear">');
            var id = y + "-" + m;

			calGrid.append(daysContainer);
			daysContainer.attr('id', id);
            // make the top row of the calendar that states the day name
            for(var i=0;i<7;i++){
                daysContainer.append('<div class="weekday h4">' + day[i] + '</div>');
            }
            // figure out how many days in the week appear before and print out last month's days for each one
            if(dayOfWeekInt !== 1 && dayOfWeekInt!== 8){
				var mVal,yVal,dVal;
				if(m==1){
					mVal=12;
					yVal=y-1;
				}else{
					mVal=m-1;
					yVal=y;
				}
				dVal = daysInGregorianMonths[mVal-1]-dayOfWeekInt+1;
                for(var i=1;i<dayOfWeekInt;i++){
                    daysContainer.append('<div class="calSquare empty hovStyle" data-value="'+yVal+'-'+pad(mVal,2)+'-'+pad(dVal+i,2)+'">'+(dVal+i)+'</div>');
                }
            }
            // print out the number of days the correct month has
            for(var i=1;i<=daysInGregorianMonth(y,m);i++){
                daysContainer.append('<div class="calSquare hovStyle" data-value="'+y+'-'+pad(m,2)+'-'+pad(i,2)+'" >' + i + '</div>');
            }

			if(lastDayofWeekInt !== 7){
				var mVal,yVal;
				if(m==12){
					mVal=1;
					yVal=y+1;
				}else{
					mVal=m+1;
					yVal=y;
				}
                for(var i=1;i<=7-lastDayofWeekInt;i++){
                    daysContainer.append('<div class="calSquare empty hovStyle" data-value="'+yVal+'-'+pad(mVal,2)+'-'+pad(i,2)+'">'+i+'</div>');
                }
            }

            daysContainer.append(monthClear);
            return calGrid;
        }

        // calendar helper functions
        var isGregorianLeapYear = function(year) {
            var isLeap = false;
            if(year%4===0) {
                isLeap = true;
            }
            if(year%100===0) {
                isLeap = false;
            }
            if(year%400===0) {
                isLeap = true;
            }
            return isLeap;
        }

        var dayOfYear = function(y, m, d) {
            var c = 0;
            for (var i=1; i<m; i++) { // Number of months passed
                c = c + daysInGregorianMonth(y,i);
            }
            c = c+d;
            return c;
        }

        var daysInGregorianMonth = function(y, m) {
            var d = daysInGregorianMonths[m-1];
            if (m==2 && isGregorianLeapYear(y)) {
                d++;
            }
            return d;
        }

        var dayOfWeek = function(y,m,d){
            var w=1; // 01-Jan-0001 is Monday, so base is Sunday
            y = (y-1)%400 + 1; // calendar cycle is 400 years
            var ly = (y-1)/4;
            ly = ly - (y-1)/100; //Adjustment
            ly = ly + (y-1)/400;
            var ry = y - 1 - ly; // Regular years passed
            w = w + ry; // Regular year has one extra week day
            w = w + 2*ly; // Leap year has two extra days
            w = w + dayOfYear(y,m,d);
            w = (w-1)%7 + 1;
            return w;
        }

        var pad = function(n, width, z) {
          z = z || '0';
          n = n + '';
          return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }

		init();

		$(el).data('nbmaacal', this);
	}

})(jQuery);
