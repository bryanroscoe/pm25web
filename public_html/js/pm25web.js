
var g = null;
var screen;
$('#graph').css('margin-left', '-20px');
//$('#graph').css('display', 'block');


function resizeGraph(){

    if($(window).width() < 768)
    {
        if($(window).width() < $(window).height() )
        {
    console.log("testing")
            g.updateOptions({
                    //xAxisLabelWidth: 30,
                    //pixelsPerLabel: 30,
                        xLabelWidth: 30,
                        pixelsPerLabel: 30,
                        //title: "PM 2.5",
                        //axisLabelWidth:20
                    })
        }
        else
        {
        }
    }
    else
    {
            g.updateOptions({
                        xLabelWidth: 60,
                        title: "",
                        pixelsPerLabel: 60
                    })
    }

}

function resizeCss(){
    //$('#titleImg').css('margin-top', ($('#titleImg').width()/1200)*(-150));
    //$('#titleImg').css('margin-bottom', ($('#titleImg').width()/1200)*(-235));
    if($(window).width() < 700)
    {
        if($(window).width() > $(window).height())
        {
            $('#graph').css('height', $(window).height()*.8)
        }
        else
        {
            $('#graph').css('height', $(window).height()/1.75)

        }
    }
    else
    {
        $('#graph').css('height', '400');
    }

}
    if($(window).width() < 700)
    {
        if($(window).width() < $(window).height() )
        {
            screen = "portrait"
        }
        else
        {
            screenType = "landscape"
        }
    }
    else
    {
        screenType = "desktop"
    }

$(window).on('resize', resizeCss);
resizeCss();

$('#titleImg').load(function(){
    console.log('img loaded')
    resizeCss();
})


//Show something while ajax is loading
$(document).ajaxStart( function() {
    "use strict";
    $("#spinner").show();

}).ajaxComplete( function() {
    "use strict";
    $("#spinner").hide();
});

$.urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    //console.log("and the names are " + results)
    return results != null ? results[1] : '';
}

year = ($.urlParam("Year") != '' ? $.urlParam("Year") : 'All')

if(year != 'All')
{
    $('#chooseYear').val(year);
}
$('#chooseYear').change(function() {
    if($(this).val() == "All Years")
    {
        window.location.href="?Year=All";
    }
    else
    {
        window.location.href="?Year="+$('#chooseYear').val();
    }
});
/*
if(year != 'All')
{
    $('#chooseYear').html(year + '<span class="caret"></span>');
}
*/
function activateModal(buttons)
{
    buttons += '<button class="btn btn-success" data-dismiss="modal" aria-hidden="true">Close</button>'
        $('#theModalFooter').html(buttons);
    $('#theModal').modal({show: true});

}


lat = null;
lon = null;
pm25data = null;

function showPosition(city, state, latitude, longitude)
{
    /* Old code for showing map
    var mapSize = 425
    if($(window).width() < 425)
    {
        mapSize = $(window).width()*.9;
    }
    if(city !== "")
        str = "You are at <br> " + city + ", " + state + " Lat:" + latitude + "<br>Long:" + longitude;
    else
        str = "You are at <br> " + city + " Lat:" + latitude + "<br>Long:" + longitude;
    str += '<br><iframe id="map" width="100%" height="350" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="http://www.openstreetmap.org/export/embed.html?bbox='
        str += (longitude-.1) + ',' + (latitude-.1) +',' + (longitude+.1) + ',' + (latitude+.1)
        str+='&amp;layer=mapquest&amp;marker=' + latitude +',' + longitude + '" style="border: 1px solid black"></iframe>'
        $("#location").html(str);   
    */


    $.ajax({
        url: "/cgi-bin/csvCreate.py/getFile?lat=" + latitude.toFixed(1) + "&long=" + longitude.toFixed(1) +"&year=" + year,
        //url: "http://www.hashemian.com/tools/form-post-tester.php/lary",
        type:'GET',
        //data: JSON.stringify({'lat':latitude.toFixed(2), 'long':longitude.toFixed(2)} ),
        dataType: 'json',
        error: function(jqXHR, textStatus, errorThrown){
            $('#theModalText').text('There was an error getting the data you wanted.');
            $('#theModalLabel').text('Data Error');
            activateModal('');
            //console.log(textStatus);
            //console.log(errorThrown);
        },
        success: function(data){
            
            
            g = new Dygraph(
                document.getElementById("graph"),
                data,
                {           
                    labels: ["Date", "Lat", "Long", "PM2.5"],
                    visibility: [false, false, true],
                    interactionModel: {},
                    panEdgeFraction: 0,
                    hideOverlayOnMouseOut: false,
                    fillGraph: true,
                    colors: ['blue'],
                    //gets rid of extra white space
                    yAxisLabelWidth: 20,

                    xAxisLabelWidth: 30,
                    pixelsPerLabel: 30,
                    //axisLabelWidth:30,
                    /*
                    axes:{
                        x:{
                            axisLabelFormatter: function(di, gran, opts, g) {
                                return  d.strftime('%Y') ;
                            }
                        }
                    }*/




                }
            );
            
            $(window).on('resize', resizeGraph);
            resizeGraph();
        }   
    });
}

function getAjaxPostion(error)
{

    jQuery.ajax({
            //crossDomain: false,
            url: "http://freegeoip.net/json/" ,
            dataType: 'json',
            success: function(data)
            {   
                showPosition(data.city , data.region_code, parseFloat(data.latitude) ,parseFloat(data.longitude));
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                $('#theModalText').text('There was an error getting the data you wanted.');
                $('#theModalLabel').text('Data Error');
                activateModal('');
            },
            async: false
            });
}

var x=document.getElementById("demo");
if (navigator.geolocation)    
{

    navigator.geolocation.getCurrentPosition(function(position){
            console.log(position);
            showPosition("","", position.coords.latitude, position.coords.longitude )
            }, getAjaxPostion);
}
else
{
    getAjaxPostion(null);
}
