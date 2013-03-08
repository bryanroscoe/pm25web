from mod_python import apache
import scriptOne
import json
import os
import getpass
import logging
from datetime import datetime
import sys

def index(req):
    req.write("nope")

def getFile(req, lat, long, year):
    monthly = False
    if year == "All":
        year =  datetime.now().strftime("%Y")
        monthly = True

    #lat = "36.825"
    #long = "-98.0525"
    dir = "/srv/www/python.davidlary.info/public_html/"
    if monthly:
        filename = dir + "csv/" + lat + long + '.csv'
        filenameSend = "csv/" + lat + long + '.csv'
    else:
        filename = dir + "csv/" + lat + long + year+ '.csv'
        filenameSend = "csv/" + lat + long + year + '.csv'

    os.chdir(dir)
    apache.import_module("sys")
    logging.basicConfig(filename="../cgi-bin/logs/csvCreator"+str(datetime.now()).replace(" ", ""), level=logging.DEBUG)
    stdout_logger = logging.getLogger('STDOUT')
    sl = scriptOne.StreamToLogger(stdout_logger, logging.INFO)
    sys.stdout = sl

    stderr_logger = logging.getLogger('STDERR')
    sl = scriptOne.StreamToLogger(stderr_logger, logging.ERROR)
    sys.stderr = sl
    print "test"
    #os.chdir('~')
    if not os.path.exists(filename):
        if monthly:
            scriptOne.scriptOne( ['script name', lat, long, filename,'-s', '2003-01-01', '-e', year + '-12-12', '-m'])
        else:
            scriptOne.scriptOne( ['script name', lat, long, filename,'-s', year + '-01-01', '-e', year + '-12-12'])

    #open('output.csv', 'w')
    req.content_type = 'text/javascript'
	#req.write('<body>')
	#req.write('<br>Time series for your location.<br>')
    req.write(json.dumps(filenameSend))
    #req.write(json.dumps(getpass.getuser()))
	#req.write('<hr>')
	#req.write('</body>')
	#return apache.OK
