$('#graph').css('margin-left', '-50px');
//$('#graph').css('display', 'block');



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
    $('#chooseYear').html(year + '<span class="caret"></span>');
}
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
            var contents = null;
            //makeGraph(data);
            $.get('/' + data, contents,makeGraph, 'text');
            //alert(data);
            
            g = new Dygraph(
                document.getElementById("graph"),
                data,
                {           
                    labels: ["Date", "Lat", "Long", "PM2.5"],
                    visibility: [false, false, true]
                }
            );
            
        }   
    });
}
function makeGraph(content)
{
    console.log(content );
    console.log(content)
    pm25data = CSVToArray(content);
    console.log($.csv.toArray(content, {delimiter: ''}));
    

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
  // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
            (
             // Delimiters.
             "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

             // Quoted fields.
             "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

             // Standard fields.
             "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
                strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
           ){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );

        }


        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );

        } else {

            // We found a non-quoted value.
            var strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}
