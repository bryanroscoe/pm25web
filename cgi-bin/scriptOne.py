import sys
import os

import scipy.io
import h5py
import numpy
import logging
baseDir = "/var/www/PM25/03_03/Mat/"


class StreamToLogger(object):
    def __init__(self, logger, log_level=logging.INFO):
        self.logger = logger
        self.log_level = log_level
        self.linebuf = ''
    def write(self, buf):
        for line in buf.rstrip().splitlines():
            self.logger.log(self.log_level, line.rstrip())




class scriptOne:
    def __init__(self, args):
        #print sys.argv
        #args = sys.argv

        #args = ['C:\\Users\\Owner\\Desktop\\work\\Mac Compat\\PM25\\scriptTwo.py', '36.825', '-98.0525', 'output.csv', '-h', 'PM25', '-s', '2003-01-01', '-e', '2003-12-31']
        #args.append('-m') #For monthly averages

        monthly = False
        lat = ''
        long = ''
        output = "output.csv"
        hdfName = "PM25"
        startDate = '1990-01-01'
        endDate = '2020-12-31'

        nextHDF = False
        nextStart = False
        nextEnd = False
        for x in args[1:]:
            if nextHDF:
                nextHDF = False
                hdfName = x
            elif nextStart:
                nextStart = False
                startDate = x
            elif nextEnd:
                nextEnd = False
                endDate = x
            elif x[0:1] == '-' and (x[1:2].lower() == 'm' or x[1:2].lower() == 'h' or x[1:2].lower() == 's' or x[1:2].lower() == 'e'):
                if x[1:2].lower() == "m":
                    monthly = True
                elif x[1:2].lower() == "h":
                    nextHDF = True
                elif x[1:2].lower() == "s":
                    nextStart = True
                elif x[1:2].lower() == "e":
                    nextEnd = True
            elif lat == "":
                lat = x
            elif long == "":
                long = x
            else:
                output = x


        logging.debug("Input = " + lat + " lat " + long + " long")
        logging.debug("Output file = " + output)
        logging.debug( "hdfName = " + hdfName)
        logging.debug("Start date = " + startDate)
        logging.debug("End date = " + endDate)

        out = open(output, 'w')
        if monthly:
            hdfName = "PM25_average"

        startDate = startDate.split('-')
        startDate[0] = int(startDate[0])
        startDate[1] = int(startDate[1])
        startDate[2] = int(startDate[2])

        endDate = endDate.split('-')
        endDate[0] = int(endDate[0])
        endDate[1] = int(endDate[1])
        endDate[2] = int(endDate[2])

        while self.dateComp(startDate, endDate) <= 0:
            date = startDate
            lat = float(lat)
            long = float(long)

            year = str(date[0])
            month = str(date[1])
            day = str(date[2])

            if date[1] < 10:
                month = "0" + month
            if date[2] < 10:
                day = "0" + day

            if monthly:
                filename = baseDir + year + os.sep + month + os.sep + "PM25_" + year + "_" + month + "_average.mat"
            else:
                filename = baseDir + year + os.sep + month + os.sep + "PM25_" + year + "_" + month + "_" + day + ".mat"

            if os.path.exists(filename):
                logging.debug(filename + ' found')
                try:
                    logging.debug(filename + ' about to open')
                    data = scipy.io.loadmat(filename)[hdfName]
                    logging.debug(filename + ' opened')
                    data = data[::-1]
                except:
                    try:
                        logging.debug(filename + ' Trying again')
                        data = h5py.File(filename)[hdfName]
                        data = numpy.transpose(data[:])
                    except:
                        logging.error( "Couldn't read " + filename + ". Check to make sure that the hdfName is accurate.")

                logging.debug( "Opened the file")
                #For filtering data...
                #min = 0
                #max = 80
                nans = numpy.isnan(data)
                data[nans] = 0
                #data = (data[:] - min) / float(max - min)

                texX = (long + 180) / 360 * data.shape[1]
                texY = (lat + 90) / 180 * data.shape[0]

                texX = ((texX % data.shape[1]) + data.shape[1]) % data.shape[1]
                texY = ((texY % data.shape[0]) + data.shape[0]) % data.shape[0]

                #print texY, texX

                interpX = texX - int(texX)
                interpY = texY - int(texY)

                texX = int(texX)
                texY = int(texY)

                #print texY, texX, interpX, interpY
                #print data[texY:texY+10, texX:texX+5]
                val = data[texY, texX] * (1 - interpX) * (1 - interpY) + data[texY + 1, texX] * interpY * (1 - interpX) + data[texY, texX + 1] * interpX * (1 - interpY) + data[texY + 1, texX + 1] * interpX * interpY
                logging.debug( "Processed data")
                if val != 0:
                    if False:
                        out.write(year + "-" + month + "," + str(lat) + "," + str(long) + "," + str(val) + "\n")
                    else:
                        out.write(year + "-" + month + "-" + day + "," + str(lat) + "," + str(long) + "," + str(val) + "\n")
                logging.debug( "Wrote data")
            else:
                logging.debug("Could not find " + filename)
                pass

            if monthly:
                startDate = self.incrMonthly(startDate)
            else:
                startDate = self.incrDate(startDate)

    def datesEq(self, dateOne, dateTwo):
        return dateOne[0] == dateTwo[0] and dateOne[1] == dateTwo[1] and dateOne[2] == dateTwo[2]

    def dateComp(self, dateOne, dateTwo):
        if dateOne[0] < dateTwo[0]:
            return -1
        elif dateOne[0] > dateTwo[0]:
            return 1
        elif dateOne[1] < dateTwo[1]:
            return -1
        elif dateOne[1] < dateTwo[1]:
            return 1
        elif dateOne[2] < dateTwo[2]:
            return -1
        elif dateOne[2] < dateTwo[2]:
            return 1

        return 0

    def incrDate(self, date):
        date[2] = date[2] + 1
        if date[2] > 31:
            date[2] = 0
            date[1] = date[1] + 1
            if date[1] > 12:
                date[1] = 1
                date[0] = date[0] + 1

        return date

    def incrMonthly(self, date):
        date[1] = date[1] + 1
        if date[1] > 12:
            date[1] = 1
            date[0] = date[0] + 1

        return date



if __name__ == '__main__':
    logging.basicConfig(filename="sciptOneLog", level=logging.DEBUG)
    run = scriptOne(sys.argv)
